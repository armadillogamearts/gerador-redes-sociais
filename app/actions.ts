'use server';

import { createGroq } from '@ai-sdk/groq';
import { generateText } from 'ai';
import { HfInference } from '@huggingface/inference';

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });
const hf = new HfInference(process.env.HF_ACCESS_TOKEN);

export async function generateContent(formData: FormData) {
  const prompt = formData.get('prompt') as string;
  const platform = formData.get('platform') as string;
  const mode = formData.get('mode') as string;
  const language = formData.get('language') as string;
  const style = formData.get('style') as string;

  let textResult = '';
  let imageResultUrl = '';

  try {
    // 1. GERAÇÃO DE TEXTO (Apenas se o modo não for estritamente de imagem)
    if (mode !== 'image_only') {
      const systemPrompt = `És um copywriter especialista em marketing digital e redes sociais. 
      O teu objetivo é criar uma publicação perfeitamente adaptada para o ${platform}.
      
      Diretrizes obrigatórias de escrita:
      - Idioma: O texto DEVE ser escrito em ${language}.
      - Tom de voz e Estilo: Aplica uma abordagem ${style}. Adapta o vocabulário, o ritmo e o uso de emojis a este estilo específico.
      - Formatação: Usa parágrafos curtos, quebras de linha para leitura escaneável e inclui 3 hashtags altamente relevantes no fim do post.
      
      ${mode === 'text_image' ? "No final do texto, adiciona EXATAMENTE a tag [PROMPT_IMAGEM]: seguida de um prompt em INGLÊS curto e puramente descritivo para gerar uma imagem que ilustre este post." : ""}`;

      const { text } = await generateText({
        model: groq('llama-3.1-8b-instant'),
        system: systemPrompt,
        prompt: prompt,
      });

      textResult = text;
    }

    // 2. GERAÇÃO DE IMAGEM OTIMIZADA
    if (mode !== 'text_only') {
      let imagePrompt = '';

      // CASO A: O modo é misto -> Extrai o prompt que o Llama já otimizou
      if (mode === 'text_image' && textResult.includes('[PROMPT_IMAGEM]:')) {
        const parts = textResult.split('[PROMPT_IMAGEM]:');
        textResult = parts[0].trim();
        imagePrompt = parts[1].trim();
      } 
      // CASO B: O modo é "Apenas Imagem" -> Usamos o Llama em background para traduzir e expandir o prompt
      else {
        console.log("A otimizar prompt de imagem em background...");
        const enhancementPrompt = `És um engenheiro de prompts especialista para o gerador de imagens FLUX. 
        Receberás uma ideia de imagem (pode estar em português) e deves transformá-la num prompt altamente descritivo, puramente em INGLÊS.
        Adiciona detalhes visuais como estilo (ex: cinematic, digital art, minimalist), iluminação (ex: soft studio lighting, neon glows) e composição.
        Responde APENAS com o prompt final em inglês, sem introduções, sem aspas e sem explicações.`;

        const { text } = await generateText({
          model: groq('llama-3.1-8b-instant'),
          system: enhancementPrompt,
          prompt: prompt,
        });
        
        imagePrompt = text.trim();
        console.log("Prompt otimizado gerado:", imagePrompt);
      }

      console.log("A enviar prompt otimizado para o Hugging Face...");

      const imageResult = await hf.textToImage({
        model: 'black-forest-labs/FLUX.1-schnell',
        inputs: imagePrompt,
        parameters: {
          num_inference_steps: 4,
        }
      });

      const imageResult = await hf.textToImage({
  model: 'black-forest-labs/FLUX.1-schnell',
  inputs: imagePrompt,
  parameters: {
    num_inference_steps: 4,
  },
});

imageResultUrl = imageResult;
    }

    return { success: true, text: textResult, image: imageResultUrl };

  } catch (error: any) {
    console.error("Erro detalhado no servidor:", error);
    if (error.message?.includes('429') || error.message?.includes('rate limit')) {
      return { success: false, error: 'Limite gratuito atingido. Tente novamente num minuto.' };
    }
    return { success: false, error: error.message || 'Erro de comunicação com os serviços de IA.' };
  }
}

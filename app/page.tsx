'use client';

import { useState } from 'react';
import { generateContent } from './actions';
import { Loader2, Copy, Download, Sparkles } from 'lucide-react';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ text?: string; image?: string } | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setResult(null);

    const formData = new FormData(event.currentTarget);
    const res = await generateContent(formData);

    setLoading(false);
    if (res.success) {
      setResult({ text: res.text, image: res.image });
    } else {
      alert('Erro: ' + res.error);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 p-6 md:p-12 flex flex-col items-center">
      <div className="w-full max-w-4xl">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-4 text-center flex items-center justify-center gap-2">
          <Sparkles className="text-cyan-400" /> Armadillo PostGen AI
        </h1>
        <h3 className="text-xl text-center mb-12">Gerador de Conteúdo para Redes Sociais impulsionado por IA</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* FORMULÁRIO */}
          <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-6 h-fit">
            <div className="space-y-2">
              <label className="text-sm font-medium">Sobre o que será o post?</label>
              <textarea
                name="prompt"
                required
                placeholder="Ex: Lançamento do meu novo portfólio de programador focado em Next.js..."
                className="w-full h-28 p-3 bg-slate-950 border border-slate-800 rounded-lg text-sm focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            <div className="space-y-2">
  <label className="text-sm font-medium">Rede Social</label>
  <select name="platform" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-sm focus:outline-none focus:border-cyan-500">
    <option value="LinkedIn">LinkedIn</option>
    <option value="Instagram">Instagram</option>
    <option value="Facebook">Facebook</option>
    <option value="Twitter/X">Twitter / X</option>
  </select>
</div>

<div className="space-y-2">
  <label className="text-sm font-medium">Estilo da Abordagem (Tom de Voz)</label>
  <select name="style" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-sm focus:outline-none focus:border-cyan-500">
    <option value="Profissional e Corporativo">Profissional e Corporativo</option>
    <option value="Visual, Descontraído e Humorado">Visual, Descontraído e Humorado</option>
    <option value="Informativo, Educacional e Técnico">Informativo, Educacional e Técnico</option>
    <option value="Persuasivo e focado em Vendas (Copywriting)">Persuasivo e Vendas</option>
  </select>
</div>


            {/* Adicione este bloco logo após o select da plataforma */}
<div className="space-y-2">
  <label className="text-sm font-medium">Idioma do Post</label>
  <select name="language" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-sm focus:outline-none focus:border-cyan-500">
    <option value="Português do Brasil">Português (Brasil)</option>
    <option value="Português de Portugal">Português (Portugal)</option>
    <option value="Inglês">Inglês</option>
    <option value="Espanhol">Espanhol</option>
  </select>
</div>


            <div className="space-y-2">
              <label className="text-sm font-medium">O que deseja gerar?</label>
              <div className="grid grid-cols-1 gap-2">
                {[['text_image', 'Texto e Imagem'], ['text_only', 'Apenas Texto'], ['image_only', 'Apenas Imagem']].map(([value, label]) => (
                  <label key={value} className="flex items-center gap-3 p-3 bg-slate-950 border border-slate-800 rounded-lg cursor-pointer hover:border-slate-700">
                    <input type="radio" name="mode" value={value} defaultChecked={value === 'text_image'} className="accent-cyan-500" />
                    <span className="text-sm">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-medium p-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <> <Loader2 className="animate-spin h-4 w-4" /> A processar... </>
              ) : (
                'Gerar Conteúdo'
              )}
            </button>
          </form>

          {/* PAINEL DE RESULTADOS */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-6 min-h-[300px] flex flex-col justify-between">
            {!result && !loading && (
              <div className="text-slate-500 text-sm h-full flex items-center justify-center text-center">
                Preencha o formulário e clique em gerar para ver o resultado.
              </div>
            )}

            {loading && (
              <div className="h-full flex flex-col items-center justify-center gap-3 text-slate-400">
                <Loader2 className="animate-spin h-8 w-8 text-cyan-500" />
                <p className="text-sm animate-pulse">A IA está a criar a sua publicação...</p>
              </div>
            )}

            {result && (
              <div className="space-y-4 h-full flex flex-col justify-between">
                <div className="space-y-4 overflow-y-auto max-h-[450px] pr-2">
                  {result.text && (
                    <div className="bg-slate-950 p-4 border border-slate-800 rounded-lg relative group">
                      <button
                        onClick={() => navigator.clipboard.writeText(result.text || '')}
                        className="absolute top-2 right-2 p-1.5 bg-slate-900 border border-slate-800 rounded hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Copiar texto"
                      >
                        <Copy size={16} />
                      </button>
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{result.text}</p>
                    </div>
                  )}

                  {result.image && (
                    <div className="relative group rounded-lg overflow-hidden border border-slate-800">
                      <img src={result.image} alt="IA Gerada" className="w-full h-auto object-cover" />
                      <a
                        href={result.image}
                        download="post-image.jpeg"
                        className="absolute bottom-2 right-2 p-2 bg-slate-900/80 backdrop-blur border border-slate-700 rounded-full hover:text-cyan-400 transition-colors"
                        title="Descarregar Imagem"
                      >
                        <Download size={18} />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
import { useState } from 'react'

type TProps = { code: string; label?: string }

/** Bloco de código com botão de copiar. */
function CodeBlock({ code, label }: TProps) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard indisponível (http, permissão negada): o usuário ainda pode selecionar o texto
    }
  }

  return (
    <div className="fl-code">
      <div className="fl-code-bar">
        <span>{label}</span>
        <button type="button" onClick={copy}>{copied ? 'Copiado!' : 'Copiar'}</button>
      </div>
      <pre>{code}</pre>
    </div>
  )
}

export default CodeBlock

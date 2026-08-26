/**
 * Formatação de valores de cupom alinhada ao backend e ao frontend web
 * (`discontapp-frontend` / `desconto/[id].tsx` + `normalizarVantagemReais`).
 *
 * Contrato da API (após persistência):
 * - `valor` / `preco`: já em reais (o app envia centavos na criação; o backend divide por 100)
 * - `vantagem_reais`: em reais (string/number). Legado: valor inteiro em centavos —
 *   se for maior que o preço do produto, interpreta como centavos (/100)
 *   (ex.: "50000", "50000.00" ou 50000 com produto 2500 → 500)
 * - `vantagem_porcentagem`: percentual numérico
 */

export function formatarNumeroReais(valor: number): string {
  return valor.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/** Converte `valor`/`preco` da API para reais (já vem em reais). */
export function valorProdutoParaReais(valor: unknown): number {
  if (valor == null || valor === '' || valor === '-') return 0
  if (typeof valor === 'number') {
    return Number.isFinite(valor) ? valor : 0
  }
  const s = String(valor).trim()
  if (s.includes(',')) {
    const n = parseFloat(s.replace(/\./g, '').replace(',', '.'))
    return Number.isNaN(n) ? 0 : n
  }
  const n = parseFloat(s)
  return Number.isNaN(n) ? 0 : n
}

/** Inteiro “de verdade”, inclusive 50000.00 / 50000.0 */
function ehInteiroEfetivo(n: number): boolean {
  return Number.isFinite(n) && Math.abs(n - Math.round(n)) < 1e-9
}

/**
 * Converte `vantagem_reais` para reais.
 * Reais: "10", "10.00", "50,00", 500.
 * Legado em centavos: inteiro (ou .00) maior que o preço (ex.: "50000.00" com produto 2500 → 500).
 */
export function vantagemReaisParaReais(
  valor: unknown,
  valorProduto?: unknown
): number | null {
  if (valor == null || valor === '' || valor === '-') return null

  const preco = valorProdutoParaReais(valorProduto)
  const precoValido = preco > 0

  const talvezCentavos = (n: number) => {
    if (precoValido && ehInteiroEfetivo(n) && n > preco) return n / 100
    return n
  }

  if (typeof valor === 'number') {
    if (!Number.isFinite(valor)) return null
    return talvezCentavos(valor)
  }

  const s = String(valor).trim()
  if (/^\d+$/.test(s)) {
    const n = parseInt(s, 10)
    return Number.isNaN(n) ? null : talvezCentavos(n)
  }

  if (s.includes(',')) {
    const n = parseFloat(s.replace(/\./g, '').replace(',', '.'))
    return Number.isNaN(n) ? null : talvezCentavos(n)
  }

  // "500.00" / "50000.00" — aplicar heurística também aqui (antes só rodava em /^\d+$/)
  const n = parseFloat(s)
  return Number.isNaN(n) ? null : talvezCentavos(n)
}

export function temVantagemReais(vantagem: unknown): boolean {
  return vantagem != null && vantagem !== '' && vantagem !== '-'
}

export function temVantagemPorcentagem(vantagem: unknown): boolean {
  return vantagem != null && vantagem !== '' && vantagem !== '-'
}

export function formatarVantagemReaisExibicao(
  valor: unknown,
  valorProduto?: unknown
): string {
  const reais = vantagemReaisParaReais(valor, valorProduto)
  if (reais == null) return String(valor ?? '')
  return formatarNumeroReais(reais)
}

/**
 * Dígitos de InputOutlinedMoney (centavos) → string em reais para a API.
 * Ex.: "50000" → "500.00"
 */
export function centavosDigitsParaReaisApi(digits: string): string {
  const only = String(digits ?? '').replace(/\D/g, '')
  if (!only) return ''
  return (Number(only) / 100).toFixed(2)
}

/** Preço “Por” após desconto (reais ou %). Preferência: valor_final da API. */
export function calcularValorPor(
  valor: unknown,
  vantagemReais: unknown,
  vantagemPorcentagem: unknown,
  valorFinal?: unknown
): number {
  const preco = valorProdutoParaReais(valor)

  if (temVantagemReais(vantagemReais)) {
    const vantagem = vantagemReaisParaReais(vantagemReais, valor) ?? 0
    return Math.max(0, preco - vantagem)
  }

  if (valorFinal != null && valorFinal !== '' && valorFinal !== '-') {
    const vf = Number(valorFinal)
    if (Number.isFinite(vf)) return Math.max(0, vf)
  }

  const pct = Number(vantagemPorcentagem) || 0
  return Math.max(0, preco * (1 - pct / 100))
}

/**
 * Formatação de valores de cupom.
 *
 * Contrato observado no app:
 * - Na criação, `valor` e `vantagem_reais` são enviados em centavos (inteiro).
 *   O backend divide por 100 e persiste em reais.
 * - Na listagem, a API devolve ambos já em reais (ex.: 10 ou "10.00" / "10,00").
 * - Cupons antigos podem vir com vantagem “duplamente dividida” (0.10 em vez de 10).
 */

/** Formata número em reais pt-BR sem depender de toLocaleString (instável no Hermes/iOS). */
export function formatarNumeroReais(valor: number): string {
  if (!Number.isFinite(valor)) return '0,00'
  const negativo = valor < 0
  const abs = Math.abs(valor)
  const [inteiroBruto, decimal = '00'] = abs.toFixed(2).split('.')
  const inteiroComMilhar = inteiroBruto.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${negativo ? '-' : ''}${inteiroComMilhar},${decimal}`
}

/** Parse de string numérica pt-BR ou en-US para number. */
function parseNumeroFlex(valor: unknown): number | null {
  if (valor == null || valor === '' || valor === '-') return null
  if (typeof valor === 'number') {
    return Number.isFinite(valor) ? valor : null
  }

  const s = String(valor).trim()
  if (!s) return null

  // pt-BR: "1.234,56" ou "10,00"
  if (s.includes(',')) {
    const n = parseFloat(s.replace(/\./g, '').replace(',', '.'))
    return Number.isNaN(n) ? null : n
  }

  // só dígitos ou decimal com ponto: "10", "10.00", "1000"
  const n = parseFloat(s)
  return Number.isNaN(n) ? null : n
}

/** Converte `valor`/`preco` da API para reais. */
export function valorProdutoParaReais(valor: unknown): number {
  return parseNumeroFlex(valor) ?? 0
}

/** Inteiro “de verdade”, inclusive 50000.00 / 50000.0 */
function ehInteiroEfetivo(n: number): boolean {
  return Number.isFinite(n) && Math.abs(n - Math.round(n)) < 1e-9
}

/**
 * Converte `vantagem_reais` da API para reais de exibição.
 * - Reais: "10", "10.00", "10,00", 10
 * - Legado em centavos grandes: "1000" com preço 50 → 10
 * - Legado dupla divisão: 0.10 / "0,10" com preço >= 10 → 10
 */
export function vantagemReaisParaReais(
  valor: unknown,
  valorProduto?: unknown
): number | null {
  const n = parseNumeroFlex(valor)
  if (n == null) return null

  const preco = valorProdutoParaReais(valorProduto)
  const precoValido = preco > 0

  // Cupom salvo com divisão a mais (app enviava reais e backend /100 de novo)
  if (n > 0 && n < 1) {
    const corrigido = Number((n * 100).toFixed(2))
    if (
      ehInteiroEfetivo(corrigido) &&
      corrigido >= 1 &&
      (!precoValido || corrigido <= preco)
    ) {
      return corrigido
    }
  }

  // Legado: inteiro grande em centavos (ex.: 1000, 50000)
  if (precoValido && ehInteiroEfetivo(n) && n >= 100 && n > preco) {
    return n / 100
  }

  return n
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
 * Dígitos de InputOutlinedMoney (centavos) → string em reais para APIs que já esperam reais.
 * Ex.: "50000" → "500.00"
 */
export function centavosDigitsParaReaisApi(digits: string): string {
  const only = String(digits ?? '').replace(/\D/g, '')
  if (!only) return ''
  return (Number(only) / 100).toFixed(2)
}

/** Dígitos de InputOutlinedMoney → centavos inteiros (mesma unidade do campo `valor` no POST). */
export function centavosDigitsParaApi(digits: string): string {
  const only = String(digits ?? '').replace(/\D/g, '')
  if (!only) return ''
  return String(Number(only))
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

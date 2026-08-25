import React from 'react'
import H3 from '../typography/H3'
import H5 from '../typography/H5'
import { View, Image, StyleSheet, TouchableOpacity, Share } from 'react-native'
import Caption from '../typography/Caption'
import { colors } from '../../styles/colors'
import IcoShare from '../../svg/IcoShare'
import IcoCopy from '../../svg/IcoCopy'
import Clipboard from '@react-native-clipboard/clipboard'
import Toast from 'react-native-toast-message'

interface PropsProduto {
  categoria_cupom: string
  codigo_cupom: string
  cupoms_disponiveis: number
  data_validade: string
  descricao_completa: string
  descricao_oferta: string
  imagem_anunciante: any
  imagem_cupom: any
  quantidade_cupons: number
  titulo_oferta: string
  vantagem_porcentagem: string
  vantagem_reais: string
  status: string
  onCompartilhar?: () => void | Promise<void>
}

export default function CardProdutoDetalhes({
  categoria_cupom,
  codigo_cupom,
  cupoms_disponiveis,
  data_validade,
  descricao_completa,
  descricao_oferta,
  imagem_anunciante,
  imagem_cupom,
  quantidade_cupons,
  titulo_oferta,
  vantagem_porcentagem,
  vantagem_reais,
  status,
  onCompartilhar,
}: PropsProduto) {
  async function handleCompartilhar() {
    if (onCompartilhar) {
      await onCompartilhar()
      return
    }
    try {
      await Share.share({
        message: `Cupom ${codigo_cupom} - ${titulo_oferta}. Confira no Discontapp!`,
        title: 'Compartilhar cupom',
      })
    } catch {
      // usuário cancelou ou erro
    }
  }

  function handleCopiar() {
    Clipboard.setString(codigo_cupom)
    Toast.show({ type: 'success', text1: 'Código copiado!' })
  }

  /** `vantagem_reais` da API já vem em reais (ex.: "10", "500.00") */
  function formatarVantagemReais(valor: string): string {
    const str = String(valor ?? '').trim().replace(',', '.')
    const num = parseFloat(str)
    if (Number.isNaN(num)) return valor
    return num.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  const temVantagemPorcentagem = vantagem_porcentagem && vantagem_porcentagem !== '-'
  const temVantagemReais = vantagem_reais && vantagem_reais !== '-'

  return (
    <View style={styles.cupom}>
      {/* Faixa superior: imagem do cupom */}
      {imagem_cupom && (
        <Image
          style={styles.imagemCupom}
          source={{ uri: imagem_cupom }}
          resizeMode="cover"
        />
      )}

      <View style={styles.conteudo}>
        {/* Cabeçalho: logo + título + categoria */}
        <View style={styles.cabecalho}>
          {imagem_anunciante && imagem_anunciante !== '-' && (
            <Image
              style={styles.logoAnunciante}
              source={{ uri: imagem_anunciante }}
            />
          )}
          <View style={styles.tituloBloco}>
            <H3>{titulo_oferta}</H3>
            <Caption color={colors.primary40} fontSize={14}>
              {categoria_cupom}
            </Caption>
          </View>
        </View>

        {/* Destaque do desconto (formato cupom) */}
        {(temVantagemPorcentagem || temVantagemReais) && (
          <View style={styles.destaqueDesconto}>
            {temVantagemPorcentagem && (
              <Caption fontSize={18} fontWeight="700" color={colors.white}>
                {vantagem_porcentagem}% de desconto
              </Caption>
            )}
            {temVantagemReais && (
              <Caption fontSize={18} fontWeight="700" color={colors.white}>
                R$ {formatarVantagemReais(vantagem_reais)} de desconto
              </Caption>
            )}
          </View>
        )}

        {/* Código do cupom */}
        <View style={styles.secao}>
          <H5>Código do cupom</H5>
          <View style={styles.codigoBox}>
            <Caption fontSize={16} fontWeight="600" align="center">
              {codigo_cupom}
            </Caption>
          </View>
        </View>

        {/* Botão Compartilhar */}
        <TouchableOpacity
          style={styles.botaoCompartilhar}
          onPress={handleCompartilhar}
          activeOpacity={0.85}
        >
          <View style={styles.botaoCompartilharIcone}>
            <IcoShare />
          </View>
          <View style={styles.botaoCompartilharTexto}>
            <Caption fontSize={16} fontWeight="700" color={colors.white}>
              Compartilhar cupom
            </Caption>
          </View>
        </TouchableOpacity>

        {/* Botão Copiar (menor destaque) */}
        <TouchableOpacity
          style={styles.botaoCopiar}
          onPress={handleCopiar}
          activeOpacity={0.85}
        >
          <View style={styles.botaoCopiarIcone}>
            <IcoCopy color={colors.primary40} />
          </View>
          <Caption fontSize={14} fontWeight="600" color={colors.primary40}>
            Copiar cupom
          </Caption>
        </TouchableOpacity>

        {/* Info em linha: status, disponibilidade, validade */}
        <View style={styles.infoLinha}>
          <View style={styles.infoItem}>
            <Caption fontSize={12} color={colors.neutralvariant50}>
              Status
            </Caption>
            <Caption
              fontSize={14}
              fontWeight="600"
              color={status === '1' ? colors.secondary70 : colors.error40}
            >
              {status === '1' ? 'Ativo' : 'Desativado'}
            </Caption>
          </View>
          <View style={styles.infoItem}>
            <Caption fontSize={12} color={colors.neutralvariant50}>
              Disponíveis
            </Caption>
            <Caption fontSize={14} fontWeight="600">
              {cupoms_disponiveis} / {quantidade_cupons}
            </Caption>
          </View>
          <View style={styles.infoItem}>
            <Caption fontSize={12} color={colors.neutralvariant50}>
              Validade
            </Caption>
            <Caption fontSize={14} fontWeight="600">
              {data_validade}
            </Caption>
          </View>
        </View>

        {/* Resumo */}
        <View style={styles.secao}>
          <H5>Resumo</H5>
          <Caption fontSize={14} margintop={4}>
            {descricao_oferta}
          </Caption>
        </View>

        {/* Descrição completa */}
        <View style={styles.secao}>
          <H5>Descrição completa</H5>
          <Caption fontSize={14} margintop={4}>
            {descricao_completa}
          </Caption>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  cupom: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.ice,
    borderWidth: 2,
    borderColor: colors.secondary50,
    borderStyle: 'solid',
  },
  imagemCupom: {
    width: '100%',
    height: 180,
    backgroundColor: colors.neutral90,
  },
  conteudo: {
    padding: 16,
  },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoAnunciante: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  tituloBloco: {
    flex: 1,
  },
  destaqueDesconto: {
    backgroundColor: colors.primary40,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  secao: {
    marginBottom: 16,
  },
  codigoBox: {
    marginTop: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.primary90,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary80,
    borderStyle: 'dashed',
  },
  botaoCompartilhar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary20,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  botaoCompartilharIcone: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  botaoCompartilharTexto: {
    marginLeft: 10,
  },
  botaoCopiar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary90,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.primary80,
  },
  botaoCopiarIcone: {
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: colors.white,
    borderRadius: 8,
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
  },
})

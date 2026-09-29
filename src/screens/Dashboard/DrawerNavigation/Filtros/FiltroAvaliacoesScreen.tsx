import { api } from '../../../../service/api'
import React, { useEffect, useState } from 'react'
import H5 from '../../../../components/typography/H5'
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native'
import Caption from '../../../../components/typography/Caption'
import CardProduto from '../../../../components/cards/CardProduto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import CardNotFound from '../../../../components/cards/CardNotFound'
import MainLayoutAutenticado from '../../../../components/layout/MainLayoutAutenticado'

function primeiroTexto(...valores: unknown[]) {
  for (const valor of valores) {
    if (valor == null) continue
    if (Array.isArray(valor)) {
      const nomes = valor
        .map((item) => {
          if (typeof item === 'string') return item
          if (item && typeof item === 'object') {
            const registro = item as { nome?: string; categorias?: string; titulo?: string }
            return registro.nome ?? registro.categorias ?? registro.titulo
          }
          return ''
        })
        .map((item) => String(item ?? '').trim())
        .filter((item) => item && item !== '-')
      if (nomes.length) return nomes.join(', ')
      continue
    }
    if (typeof valor === 'object') {
      const registro = valor as { nome?: string; categorias?: string; titulo?: string }
      const aninhado = registro.nome ?? registro.categorias ?? registro.titulo
      if (aninhado && String(aninhado).trim() && String(aninhado).trim() !== '-') {
        return String(aninhado).trim()
      }
      continue
    }
    const texto = String(valor).trim()
    if (texto && texto !== '-' && texto !== 'null') return texto
  }
  return ''
}

function mesclarDefinidos(base: any, extra: any) {
  const resultado = { ...base }
  if (!extra || typeof extra !== 'object') return resultado
  Object.entries(extra).forEach(([chave, valor]) => {
    if (valor != null && valor !== '' && valor !== '-') resultado[chave] = valor
  })
  return resultado
}

function listaResultados(data: any) {
  const bruto = data?.results ?? data?.data ?? data
  if (Array.isArray(bruto)) return bruto
  if (Array.isArray(bruto?.ofertas)) return bruto.ofertas
  if (Array.isArray(bruto?.cupons)) return bruto.cupons
  if (Array.isArray(bruto?.data)) return bruto.data
  return []
}

function normalizarOferta(item: any) {
  const aninhado = item?.oferta ?? item?.cupom ?? item?.dados_oferta
  const base = mesclarDefinidos(item ?? {}, aninhado)
  const valor = base.valor ?? base.preco ?? base.valor_produto ?? base.valor_item
  const categoria = primeiroTexto(base.categoria_cupom, base.categorias, base.categoria, base.nome_categoria)
  const imagem = primeiroTexto(base.imagem, base.imagem_cupom, base.imagem_capa, base.foto)
  return {
    ...base,
    valor,
    preco: base.preco ?? valor,
    categoria_cupom: categoria,
    imagem,
    imagem_cupom: imagem,
    vantagem_reais: base.vantagem_reais ?? base.desconto_reais ?? base.valor_desconto,
    vantagem_porcentagem: base.vantagem_porcentagem ?? base.desconto_porcentagem ?? base.porcentagem,
    qtd_avaliacoes: base.qtd_avaliacoes ?? base.total_avaliacoes ?? base.quantidade_avaliacoes,
    media_avaliacoes: base.media_avaliacoes ?? base.media ?? base.nota,
    anunciante: base.anunciante ?? base.nome_fantasia ?? base.nome_empresa ?? base.nome,
    anunciante_id: base.anunciante_id ?? base.id_anunciante,
    titulo_oferta: base.titulo_oferta ?? base.titulo ?? base.nome_produto ?? base.nome,
    data_validade: base.data_validade ?? base.validade,
    imagem_anunciante: base.imagem_anunciante ?? base.logomarca,
    descricao_oferta: base.descricao_oferta ?? base.descricao,
  }
}
export default function FiltroAvaliacoesScreen() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [melhoresAvaliacoes, setMelhoresAvaliacoes] = useState<any[]>([])

  async function getCupons() {
    const jsonValue = await AsyncStorage.getItem('infos-user')
    setIsRefreshing(true)
    if (jsonValue) {
      const newJson = JSON.parse(jsonValue)
      try {
        const headers = {
          Authorization: `Bearer ${newJson.token}`
        }
        const response = await api.get(`/ofertas/anunciantes-mais-avaliados`, {
          headers,
        })
        setMelhoresAvaliacoes(listaResultados(response.data).map(normalizarOferta))
      } catch (error: any) {
        console.error('ERROR - Filtro Melhores Avaliações: ', error.response.data)
      }
      setIsRefreshing(false)
    } else {
      setIsRefreshing(false)
    }
  }

  const renderItem = ({ item }: any) => (
    <CardProduto
      key={item.id}
      id_oferta={item.id}
      dados_gerais={item}
      get_produtos={getCupons}
      data_validade={item.data_validade}
      nome_produto={item.titulo_oferta}
      imagem_capa={item.imagem || item.imagem_cupom}
      categoria={item.categoria_cupom}
      descricao_simples={item.descricao_oferta}
      nome_empresa={item.anunciante}
      id_anunciante={item.anunciante_id}
      descricao_completa={item.descricao_completa}
      qr_code={item.codigo_cupom}
      vantagem_porcentagem={item.vantagem_porcentagem}
      vantagem_reais={item.vantagem_reais}
      foto_user={item.imagem_anunciante}
      total_avaliacao={item.qtd_avaliacoes}
      media_avaliacao={item.media_avaliacoes}
      status_favorito={item.status_favorito}
    />
  )

  const handleRefresh = () => {
    getCupons()
  }

  useEffect(() => {
    getCupons()
  }, [])

  return (
    <MainLayoutAutenticado notScroll={true} loading={isRefreshing} bottomDrawer marginTop={0}>
      <View style={styles.container}>
        <View className='mt-[20%]' />
        <H5>Resultado da busca</H5>
        <View className='pb-3'>
          <Caption fontSize={14} fontWeight={'400'}>
            {melhoresAvaliacoes.length === 1
              ? '1 oferta encontrada'
              : `${melhoresAvaliacoes.length} ofertas encontradas`}
          </Caption>
        </View>

        <View style={styles.listWrapper}>
          {melhoresAvaliacoes.length > 0 &&
            <FlatList
              data={melhoresAvaliacoes}
              style={styles.list}
              contentContainerStyle={styles.listContent}
              renderItem={renderItem}
              keyExtractor={(item: any, index) => String(item.id ?? index)}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={handleRefresh}
                />
              }
            />
          }
          {!isRefreshing && melhoresAvaliacoes.length === 0 &&
            <View className='w-full '>
              <CardNotFound titulo='Não encontramos cupons no momento para você' />
            </View>
          }
        </View>
      </View>
    </MainLayoutAutenticado>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listWrapper: {
    flex: 1,
    marginTop: 8,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 220,
  },
})

import { api } from '../../../../service/api'
import React, { useEffect, useState } from 'react'
import { useNavigate } from '../../../../hooks/useNavigate'
import { FlatList, RefreshControl, View, StyleSheet } from 'react-native'
import Caption from '../../../../components/typography/Caption'
import CardEmpresa from '../../../../components/cards/CardEmpresa'
import AsyncStorage from '@react-native-async-storage/async-storage'
import CardNotFound from '../../../../components/cards/CardNotFound'
import HeaderPrimary from '../../../../components/header/HeaderPrimary'
import MainLayoutAutenticado from '../../../../components/layout/MainLayoutAutenticado'
import CardProduto from '@components/cards/CardProduto'

export default function FiltroOfertasPorcentagemScreen() {
  const { navigate } = useNavigate()
  const [totalCupons, setTotalCupons] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [cuponsPorcentagem, setCuponsPorcentagem] = useState([])

  async function getOfertas() {
    const jsonValue = await AsyncStorage.getItem('infos-user')
    setIsRefreshing(true)
    if (jsonValue) {
      const newJson = JSON.parse(jsonValue)
      try {
        const headers = {
          Authorization: `Bearer ${newJson.token}`,
          'Content-Type': 'multipart/form-data'
        }
        const formData = {
          vantagem: "vantagem_porcentagem"
        }
        const response = await api.get(`/cupons/melhores-ofertas`, {
          headers,
          params: formData
        })
        setCuponsPorcentagem(response.data.results)
        setTotalCupons(response.data.results.length)

      } catch (error: any) {
        console.error('ERROR - Filtro Melhores Ofertas: ', error.response.data)
      }
      setIsRefreshing(false)
    }
  }

  const renderItem = ({ item }: any) => (
    <CardProduto
      key={item.id}
      id_oferta={item.id}
      dados_gerais={item}
      imagem_capa={item.imagem_cupom}
      get_produtos={getOfertas}
      qr_code={item.codigo_cupom}
      nome_empresa={item.anunciante}
      categoria={item.categoria_cupom}
      nome_produto={item.titulo_oferta}
      id_anunciante={item.anunciante_id}
      data_validade={item.data_validade}
      foto_user={item.imagem_anunciante}
      vantagem_reais={item.vantagem_reais}
      total_avaliacao={item.qtd_avaliacoes}
      status_favorito={item.status_favorito}
      media_avaliacao={item.media_avaliacoes}
      descricao_simples={item.descricao_oferta}
      descricao_completa={item.descricao_completa}
      vantagem_porcentagem={item.vantagem_porcentagem}
    />
  )

  const handleRefresh = () => {
    getOfertas()
  }

  useEffect(() => {
    getOfertas()
  }, [])

  return (
    <MainLayoutAutenticado notScroll={true} bottomDrawer marginTop={0} marginHorizontal={0}>
      <View style={styles.container}>
        <View className='mt-[4%]' />
        <HeaderPrimary titulo='Resultado da busca' voltarScreen={() => navigate('FiltroOfertasScreen')} />
        <View style={styles.content}>
          {totalCupons &&
            <Caption fontSize={14} fontWeight={'400'}>{totalCupons} oferta(s) encontrada(s)</Caption>
          }
          <View style={styles.listWrapper}>
            {cuponsPorcentagem && cuponsPorcentagem.length > 0 &&
              <FlatList
                data={cuponsPorcentagem as any}
                renderItem={renderItem as any}
                keyExtractor={(item: any) => String(item.id)}
                contentContainerStyle={styles.listContent}
                refreshControl={
                  <RefreshControl
                    refreshing={isRefreshing}
                    onRefresh={handleRefresh}
                  />
                }
                showsVerticalScrollIndicator={false}
              />
            }

            {!isRefreshing && cuponsPorcentagem.length <= 0 &&
              <CardNotFound titulo='Não encontramos cupons no momento para você' />
            }
          </View>
        </View>
      </View>
    </MainLayoutAutenticado>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    marginHorizontal: 24,
  },
  listWrapper: {
    flex: 1,
    marginTop: 24,
  },
  listContent: {
    paddingBottom: 220,
  },
})

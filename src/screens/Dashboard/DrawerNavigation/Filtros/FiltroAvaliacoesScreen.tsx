import { api } from '../../../../service/api'
import React, { useEffect, useState } from 'react'
import H5 from '../../../../components/typography/H5'
import { useNavigate } from '../../../../hooks/useNavigate'
import { FlatList, RefreshControl, View } from 'react-native'
import Caption from '../../../../components/typography/Caption'
import CardProduto from '../../../../components/cards/CardProduto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import CardNotFound from '../../../../components/cards/CardNotFound'
import MainLayoutAutenticado from '../../../../components/layout/MainLayoutAutenticado'

interface ICupom {
  id: number
  ativo: string
  anunciante: string
  assinatura: string
  data_criacao: string
  codigo_cupom: string
  imagem_cupom: string
  data_validade: string
  titulo_oferta: string
  vantagem_reais: string
  categoria_cupom: string
  descricao_oferta: string
  imagem_anunciante: string
  quantidade_cupons: number
  cupoms_disponiveis: number
  descricao_completa: string
  id_categoria_cupom: number
  vantagem_porcentagem: string
}

export default function FiltroAvaliacoesScreen() {
  const { navigate } = useNavigate()
  const [totalCupons, setTotalCupons] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [melhoresAvaliacoes, setCuponsPorcentagem] = useState<ICupom>()

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
        setCuponsPorcentagem(response.data.results)
        setTotalCupons(response.data.results.length)
      } catch (error: any) {
        console.error('ERROR - Filtro Melhores Avaliações: ', error.response.data)
      }
      setIsRefreshing(false)
    }
  }

  const renderItem = ({ item }: any) => (
    <CardProduto
      key={item.id}
      id_oferta={item.id}
      dados_gerais={item}
      data_validade={item.data_validade}
      nome_filial={item.categoria_cupom}
      nome_produto={item.titulo_oferta}
      imagem_capa={item.imagem_cupom}
      descricao_simples={item.descricao_oferta}
      nome_empresa={item.anunciante}
      id_anunciante={item.anunciante_id}
      descricao_completa={item.descricao_completa}
      qr_code={item.codigo_cupom}
      vantagem_porcentagem={item.vantagem_porcentagem}
      vantagem_reais={item.vantagem_reais}
      foto_user={item.imagem_anunciante}
    />
  )

  const handleRefresh = () => {
    getCupons()
  }

  useEffect(() => {
    getCupons()
  }, [])

  return (
    <MainLayoutAutenticado notScroll={true} loading={isRefreshing} bottomDrawer>
      <View className='mb-6 mt-[20%]'>
        <H5>Resultado da busca</H5>
        <View className='pb-3'>
          {totalCupons && totalCupons.length <= 1 ?
            < Caption fontSize={14} fontWeight={'400'}>{totalCupons ?? '0'} cupom encontrado</Caption>
            :
            <Caption fontSize={14} fontWeight={'400'}>{totalCupons} cupoms encontrados</Caption>
          }
        </View>

        {melhoresAvaliacoes &&
          <FlatList
            data={melhoresAvaliacoes as any}
            className='mb-72'
            renderItem={renderItem}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
              />
            }
          />
        }
        {!isRefreshing && !melhoresAvaliacoes &&
          <View className='w-full '>
            <CardNotFound titulo='Não encontramos cupons no momento para você' />
          </View>
        }
      </View>
    </MainLayoutAutenticado >
  )
}

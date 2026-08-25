import React, { useEffect, useState } from 'react'
import H5 from '../../../../components/typography/H5'
import { useNavigate } from '../../../../hooks/useNavigate'
import Caption from '../../../../components/typography/Caption'
import MainLayoutAutenticado from '../../../../components/layout/MainLayoutAutenticado'
import CardProduto from '../../../../components/cards/CardProduto'
import { FlatList, View, RefreshControl } from 'react-native'
import { api, api_contrato } from '../../../../service/api'
import AsyncStorage from '@react-native-async-storage/async-storage'
import MainLayoutAutenticadoSemScroll from '../../../../components/layout/MainLayoutAutenticadoSemScroll'

export default function FiltroCuponVigenteScreen() {
  const { navigate } = useNavigate()
  const [listaprodutos, setProdutos] = useState([])
  const [listacategorias, setCategorias] = useState([])
  const [isRefreshing, setIsRefreshing] = useState(false)

  async function getProdutos() {
    setIsRefreshing(true)
    const jsonValue = await AsyncStorage.getItem('infos-user')
    if (jsonValue) {
      const newJson = JSON.parse(jsonValue)
      try {
        const headers = {
          Authorization: `Bearer ${newJson.token}`,
        }
        const response = await api.get(`/cupons`, { headers })
        setProdutos(response.data.results)
      } catch (error: any) {
        console.error(error)
      }
    }
    setIsRefreshing(false)
  }

  async function getCategorias() {
    setIsRefreshing(true)
    try {
      const response = await api.get(`/categorias`)
      setCategorias(response.data.results)
    } catch (error: any) {
      console.error(error)
    }
    setIsRefreshing(false)
  }

  const handleRefresh = () => {
    getProdutos()
  }

  const renderItem = ({ item }: any) => (
    <CardProduto
      key={item.id}
      dados_gerais={item}
      id_oferta={item.id}
      qr_code={item.codigo_cupom}
      data_validade={item.data_validade}
      nome_empresa={item.anunciante}
      imagem_capa={item.imagem_cupom}
      nome_produto={item.titulo_oferta}
      nome_filial={item.categoria_cupom}
      foto_user={item.imagem_anunciante}
      id_anunciante={item.anunciante_id}
      vantagem_reais={item.vantagem_reais}
      descricao_simples={item.descricao_oferta}
      descricao_completa={item.descricao_completa}
      vantagem_porcentagem={item.vantagem_porcentagem}
    />
  );

  useEffect(() => {
    getProdutos()
    getCategorias()
  }, [])

  return (
    <MainLayoutAutenticadoSemScroll bottomDrawer>
      <H5>Resultado da busca</H5>
      <Caption fontSize={14} fontWeight={'400'}>{listaprodutos.length} cupon(s) vigentes</Caption>
      <View className='mt-3 mb-6'>
        <FlatList
          data={listaprodutos}
          className='mb-16'
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
            />
          }
        />
      </View>
    </MainLayoutAutenticadoSemScroll>
  )
}

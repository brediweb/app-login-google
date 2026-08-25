import { api } from '../../service/api'
import React, { useState, useEffect } from 'react'
import { useNavigate } from '../../hooks/useNavigate'
import { useIsFocused } from '@react-navigation/native'
import CardProduto from '../../components/cards/CardProduto'
import { View, FlatList, RefreshControl, Text } from 'react-native'
import HeaderPrimary from '../../components/header/HeaderPrimary'
import AsyncStorage from '@react-native-async-storage/async-storage'
import MainLayoutAutenticado from '../../components/layout/MainLayoutAutenticado'

export default function OfertaDetalhesGeraCupomScreen(props: any) {
  const isFocused = useIsFocused()
  const { navigate } = useNavigate()
  const [loading, setLoading] = useState(true)
  const [listaprodutos, setListaProdutos] = useState([])
  const id_oferta = props.route.params.id

  async function getDetalhe() {
    setLoading(true)
    const jsonValue = await AsyncStorage.getItem('infos-user')
    if (jsonValue) {
      const newJson = JSON.parse(jsonValue)
      try {
        const headers = {
          Authorization: `Bearer ${newJson.token}`,
          'Content-Type': 'multipart/form-data'
        }
        const response = await api.get(`/cupons/${id_oferta}`, { headers })
        setListaProdutos(response.data.results)
      } catch (error: any) {
        console.error('ERRO Detalhe Oferta:', error.response.data)
      }
      setLoading(false)
    }
  }

  const renderItem = ({ item }: any) => (
    <CardProduto
      key={item.id}
      id_oferta={item.id}
      dados_gerais={item}
      qr_code={item.codigo_cupom}
      nome_empresa={item.anunciante}
      categoria={item.categoria_cupom}
      imagem_capa={item.imagem_cupom}
      nome_produto={item.titulo_oferta}
      id_anunciante={item.anunciante_id}
      data_validade={item.data_validade}
      nome_filial={item.categoria_cupom}
      foto_user={item.imagem_anunciante}
      vantagem_reais={item.vantagem_reais}
      descricao_simples={item.descricao_oferta}
      descricao_completa={item.descricao_completa}
      vantagem_porcentagem={item.vantagem_porcentagem}
    />
  )

  const handleRefresh = () => {
    getDetalhe()
  }

  useEffect(() => {
    getDetalhe()
  }, [isFocused])

  return (
    <>
      <MainLayoutAutenticado notScroll={true} marginHorizontal={0} marginTop={0} loading={loading}>
        <View >
          <View className='mr-4'>
            <HeaderPrimary titulo={`Detalhes da Oferta`} voltarScreen={() => navigate('FiltroOfertasScreen')} />
          </View>
          <View className='mx-6'>
            {listaprodutos &&
              <FlatList
                data={listaprodutos}
                className='mb-16'
                renderItem={renderItem}
                refreshControl={
                  <RefreshControl
                    refreshing={loading}
                    onRefresh={handleRefresh}
                  />
                }
              />}
          </View>
        </View>

      </MainLayoutAutenticado>
    </>
  );
}

import { api } from '../../service/api'
import { ScrollView } from 'react-native'
import H3 from '../../components/typography/H3'
import React, { useEffect, useState } from 'react'
import { useNavigate } from '../../hooks/useNavigate'
import { useIsFocused } from '@react-navigation/native'
import Caption from '../../components/typography/Caption'
import CardProduto from '../../components/cards/CardProduto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { FlatList, RefreshControl, Image, View } from 'react-native'
import MainLayoutAutenticado from '../../components/layout/MainLayoutAutenticado'
import { useGlobal } from '../../context/GlobalContextProvider'
import ButtonSecondary from '../../components/buttons/ButtonSecondary'
import ButtonPrimary from '../../components/buttons/ButtonPrimary'
import FilledButton from '../../components/buttons/FilledButton'
import { colors } from '../../styles/colors'
import Spacing from '@components/layout/Spacing'

export default function FavoritosScreen() {
  const isFocused = useIsFocused()
  const { navigate } = useNavigate()
  const { usuarioLogado } = useGlobal()
  const [listaprodutos, setProdutos] = useState([])
  const [listacategorias, setCategorias] = useState([])
  const [isRefreshing, setIsRefreshing] = useState(true)

  async function getFavoritos() {
    setIsRefreshing(true)
    const jsonValue = await AsyncStorage.getItem('infos-user')
    if (jsonValue) {

      const newJson = JSON.parse(jsonValue)
      try {
        const headers = {
          Authorization: `Bearer ${newJson.token}`,
        }
        const response = await api.get(`/favorito/salvos`, { headers })
        setProdutos(response.data.favoritos)
      } catch (error: any) {
        console.error('ERROR Lista Cupons: ', error.response.data)
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
      console.error('ERROR Categorias: ', error.response.data)
    }
    setIsRefreshing(false)
  }

  const handleRefresh = () => {
    getFavoritos()
    getCategorias()
  }

  const renderItem = ({ item }: any) => (
    <CardProduto
      key={item.id}
      id_oferta={item.id}
      status_favorito={item.status_favorito ?? true}
      nome_empresa={item.nome_anunciante}
      dados_gerais={item}
      nome_filial={item.filial}
      get_produtos={getFavoritos}
      id_anunciante={item.anunciante_id}
      qr_code={item.codigo_cupom}
      categoria={item.categoria_cupom}
      data_validade={item.validade}
      imagem_capa={item.imagem_cupom}
      nome_produto={item.nome}
      foto_user={item.imagem_anunciante}
      descricao_completa={item.descricao}
      vantagem_reais={item.vantagem_reais}
      descricao_simples={item.descricao_oferta}
      vantagem_porcentagem={item.vantagem_porcentagem}
    />
  )

  useEffect(() => {
    getFavoritos()
    getCategorias()
  }, [isFocused])

  return (
    <MainLayoutAutenticado loading={isRefreshing} notScroll={true}>
      <Spacing />
      {listaprodutos.length >= 1 &&
        <FlatList
          data={listaprodutos}
          className='mb-8'
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
            />
          }
        />}

      {!listaprodutos || listaprodutos.length <= 0 && !isRefreshing && usuarioLogado &&
        <View className="justify-center items-center mt-20">
          <Image className='mx-auto mb-5' source={require('../../../assets/img/sem-favoritos.png')} />
          <H3 align={'center'} color='#000'>Você ainda não tem favoritos</H3>
          <Caption align={'center'}>
            Escolha as melhores ofertas na timeline, e guarde aqui neste espaço!
          </Caption>
        </View>
      }
      {!usuarioLogado &&
        <View className='h-full w-full flex-col justify-between'>
          <View />
          <View>
            <H3 align={'center'} color='#000'>Para acessar essa área você precisa estar logado!</H3>
            <View className='h-1' />
            <Caption align={'center'}>
              Crie uma conta ou faça login em uma conta existente
            </Caption>
          </View>
          <View className='pb-32'>
            <View className='h-2' />
            <FilledButton backgroundColor={colors.secondary50} onPress={() => navigate('FormPessoaFisicaScreen')} title='Criar conta' />
            <View className='h-2' />
            <FilledButton backgroundColor={colors.secondary50} onPress={() => navigate('LoginClienteScreen')} title='Fazer login' />
          </View>
        </View>
      }
    </MainLayoutAutenticado>
  );
}

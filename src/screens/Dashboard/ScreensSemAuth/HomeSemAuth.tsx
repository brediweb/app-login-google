import { api } from '../../../service/api'
import { colors } from '../../../styles/colors'
import React, { useEffect, useState } from 'react'
import { useIsFocused } from '@react-navigation/native'
import { useNavigate } from '../../../hooks/useNavigate'
import Caption from '../../../components/typography/Caption'
import CardProduto from '../../../components/cards/CardProduto'
import CardAnuncio from '../../../components/cards/CardAnuncio'
import CardNotFound from '../../../components/cards/CardNotFound'
import CardCategoria from '../../../components/cards/CardCategoria'
import AsyncStorage from '@react-native-async-storage/async-storage'
import ButtonOutline from '../../../components/buttons/ButtonOutline'
import ModalTemplateLogin from '../../../components/Modals/ModalTemplateLogin'
import MainLayoutAutenticado from '../../../components/layout/MainLayoutAutenticado'
import { FlatList, Platform, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import Spacing from '@components/layout/Spacing'

export default function HomeSemAuth() {
  const isFocused = useIsFocused()
  const { navigate } = useNavigate()
  const [listaprodutos, setProdutos] = useState([])
  const [listacategorias, setCategorias] = useState([])
  const [isRefreshing, setIsRefreshing] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [cidadeSelecionada, setCidade] = useState<any>(null)
  const [estadoSelecionado, setEstado] = useState<any>(null)

  async function getProdutos() {
    setProdutos([])
    setIsRefreshing(true)

    try {
      const jsonCidade = await AsyncStorage.getItem("cidade")
      const jsonEstado = await AsyncStorage.getItem('estado')

      if (jsonCidade && jsonEstado) {
        setProdutos([])
        // const atualCidade = JSON.parse(jsonCidade)
        // const atualEstado = JSON.parse(jsonEstado)
        // setEstado(atualEstado)
        // setCidade(atualCidade)
        // const response = await api.get(`/cupons?estado=${atualEstado.sigla}&cidade=${atualCidade.nome}`)
        // setProdutos(response.data.results)

      } else {
        const response = await api.get(`/cupons/cupons/v2`)
        setProdutos(response.data.results)
        setEstado(null)
        setCidade(null)
      }

    } catch (error: any) {
      console.error('ERROR Lista Cupons(Sem auth): ', error.response.data)
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
    getProdutos()
  }

  const renderItem = ({ item }: any) => (
    item.anuncio === false ?
      <CardProduto
        key={item.id}
        dados_gerais={item}
        id_oferta={item.id}
        imagem_capa={item.imagem}
        get_produtos={getProdutos}
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
      :
      <CardAnuncio
        key={item.id}
        nome={item.nome}
        latitude={item.latitude}
        imagem={item.imagem_cupom}
        descricao={item.descricao}
        descricao_oferta={item.descricao_oferta}
      />
  )

  useEffect(() => {
    getCategorias()
    getProdutos()
  }, [])

  useEffect(() => {
    getCategorias()
    getProdutos()
  }, [isFocused])

  return (
    <MainLayoutAutenticado notScroll={true} loading={isRefreshing}>
      <ModalTemplateLogin visible={modalVisible} onClose={() => setModalVisible(false)} />
      <Spacing />
      <ScrollView horizontal={true} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} className='w-full h-0 pb-0 mt-2'>
        <CardCategoria
          ativo={false}
          slug={'todas'}
          titulo={'Todas'}
          onPress={() => navigate('HomeSemAuth')}
        />
        {listacategorias && listacategorias.map((categoria: any) => (
          <CardCategoria
            ativo={false}
            key={categoria.id}
            slug={categoria.id}
            titulo={categoria.categorias}
            onPress={() => navigate('HomeSemAuthFiltradaScreen', { idCategoria: categoria.id })}
          />
        ))}
      </ScrollView >

      <View className="flex-row">
        <Text className="text-[24px] font-semibold text-[#000] mb-3"> Boas-vindas, Visitante 🎉</Text>
      </View>

      {estadoSelecionado && cidadeSelecionada &&
        <TouchableOpacity onPress={() => navigate('FiltroCidadeScreen')} className=' ml-2'>
          <Caption fontSize={14} fontWeight={"700"} >Filtrado para {cidadeSelecionada.nome} - {estadoSelecionado.sigla}</Caption>
        </TouchableOpacity>
      }

      {!isRefreshing && listaprodutos.length <= 0 &&
        <View className='w-full flex-1 justify-center items-center'>
          <CardNotFound titulo='Não encontramos cupons no momento para você' />
          <View className='mt-3 mx-8'>
            <ButtonOutline title='Sugerir estabelecimentos' onPress={() => setModalVisible(true)} />
          </View>
        </View>
      }

      {listaprodutos.length >= 1 &&
        <FlatList
          data={listaprodutos}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
            />
          }
          showsVerticalScrollIndicator={false}
        />}


    </MainLayoutAutenticado>
  );
}

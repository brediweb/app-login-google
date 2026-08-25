
import { api } from '../../../service/api'
import { colors } from '../../../styles/colors'
import React, { useEffect, useState } from 'react'
import { useNavigate } from '../../../hooks/useNavigate'
import CardAnuncio from '../../../components/cards/CardAnuncio'
import CardProduto from '../../../components/cards/CardProduto'
import CardNotFound from '../../../components/cards/CardNotFound'
import CardCategoria from '../../../components/cards/CardCategoria'
import ModalTemplateLogin from '../../../components/Modals/ModalTemplateLogin'
import MainLayoutAutenticado from '../../../components/layout/MainLayoutAutenticado'
import { FlatList, RefreshControl, ScrollView, Text, TouchableOpacity, View, } from 'react-native'
import ButtonOutline from '../../../components/buttons/ButtonOutline'
import Spacing from '@components/layout/Spacing'

export default function HomeSemAuthFiltradaScreen(route: any) {
  const { navigate } = useNavigate()
  const [listaprodutos, setProdutos] = useState([])
  const idCategoria = route.route.params.idCategoria
  const [listacategorias, setCategorias] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  async function getProdutos() {
    setIsRefreshing(true)
    try {
      setProdutos([])
      const response = await api.get(`/cupons/cupons/v2/categoria/${idCategoria}`)
      setProdutos(response.data.results)
    } catch (error: any) {
      console.error('Error Filtrar Categoria(no auth):', error)
    }
    setIsRefreshing(false);
  }

  async function getCategorias() {
    try {
      const [resCategorias, resCupons] = await Promise.all([
        api.get('/categorias'),
        api.get('/cupons/cupons/v2'),
      ])
      const todasCategorias = resCategorias.data?.results ?? []
      const cupons = resCupons.data?.results ?? []
      const idsComCupons = new Set(
        cupons
          .filter((item: any) => !item.anuncio && (item.id_categoria_cupom != null || item.categoria_id != null))
          .map((item: any) => item.id_categoria_cupom ?? item.categoria_id)
      )
      const categoriasComCupom = todasCategorias.filter((c: any) => idsComCupons.has(c.id))
      setCategorias(categoriasComCupom)
    } catch (error: any) {
      console.error('Error Listar Categorias: ', error)
    }
  }

  const handleRefresh = () => {
    getProdutos();
  };

  const renderItem = ({ item }: any) => (
    item.anuncio ?
      <CardAnuncio
        key={item.id}
        nome={item.nome}
        imagem={item.imagem}
        latitude={item.latitude}
        longitude={item.longitude}
        descricao={item.descricao}
      />
      :
      <CardProduto
        key={item.id}
        dados_gerais={item}
        id_oferta={item.id}
        get_produtos={getProdutos}
        qr_code={item.codigo_cupom}
        nome_empresa={item.anunciante}
        imagem_capa={item.imagem_cupom}
        categoria={item.categoria_cupom}
        nome_produto={item.titulo_oferta}
        id_anunciante={item.anunciante_id}
        data_validade={item.data_validade}
        foto_user={item.imagem_anunciante}
        vantagem_reais={item.vantagem_reais}
        status_favorito={item.status_favorito}
        descricao_simples={item.descricao_oferta}
        descricao_completa={item.descricao_completa}
        vantagem_porcentagem={item.vantagem_porcentagem}
      />
  )

  useEffect(() => {
    getProdutos()
    getCategorias()
  }, [])

  useEffect(() => {
    getProdutos()
    getCategorias()
  }, [idCategoria])

  const temCupons = listaprodutos.length >= 1
  const semCupons = !isRefreshing && listaprodutos.length <= 0

  return (
    <MainLayoutAutenticado notScroll={true} loading={isRefreshing}>
      <Spacing />
      <ModalTemplateLogin visible={modalVisible} onClose={() => setModalVisible(false)} />

      {/* Categorias: sempre visível no topo */}
      <ScrollView
        horizontal
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        className='w-full h-14 pb-2 mb-1'
      >
        <CardCategoria
          ativo={false}
          slug='todas'
          titulo='Todas'
          onPress={() => navigate('HomeSemAuth')}
        />
        {listacategorias?.map((categoria: any) => (
          <CardCategoria
            key={categoria.id}
            ativo={idCategoria === categoria.id}
            slug={categoria.id}
            titulo={categoria.categorias}
            onPress={() => navigate('HomeSemAuthFiltradaScreen', { idCategoria: categoria.id })}
          />
        ))}
      </ScrollView>

      {temCupons && (
        <FlatList
          data={listaprodutos}
          className='mb-60'
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
          }
        />
      )}

      {semCupons && (
        <View className='flex-1 justify-center items-center'>
          <View className='w-full px-8 items-center'>
            <CardNotFound titulo='Não há cupons disponíveis para esta categoria no momento.' />
            <View className='mt-5 gap-3 w-full items-center'>
              <ButtonOutline title='Sugerir estabelecimentos' onPress={() => setModalVisible(true)} />
              <TouchableOpacity onPress={() => navigate('HomeSemAuth')} className='py-2'>
                <Text style={{ fontSize: 14, color: colors.gray }}>Voltar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </MainLayoutAutenticado>
  );
}

import { api } from '../../service/api'
import React, { useEffect, useState } from 'react'
import { useNavigate } from '../../hooks/useNavigate'
import { useIsFocused } from '@react-navigation/native'
import Caption from '../../components/typography/Caption'
import CardProduto from '../../components/cards/CardProduto'
import CardAnuncio from '../../components/cards/CardAnuncio'
import CardNotFound from '../../components/cards/CardNotFound'
import CardCategoria from '../../components/cards/CardCategoria'
import ButtonOutline from '../../components/buttons/ButtonOutline'
import AsyncStorage from '@react-native-async-storage/async-storage'
import MainLayoutAutenticado from '../../components/layout/MainLayoutAutenticado'
import { FlatList, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { temDiscontokenNoPerfil } from '../../utils/discontokenPerfil'

interface DadosPerfil {
  nome_completo?: string
  nome?: string
  sobrenome?: string
  tipo_usuario?: string
  email?: string
  id?: number
  token?: string
  cod_status?: number
  mensagem?: string
  associacao_id?: number | string | null
  discotoken?: string | number | boolean | null
}

export default function HomeScreen() {
  const isFocused = useIsFocused()
  const insets = useSafeAreaInsets()
  const { navigate } = useNavigate()
  const [primeiroNome, setPrimeiroNome] = useState('')
  const [listaprodutos, setProdutos] = useState([])
  const [listacategorias, setCategorias] = useState<any[]>([])
  const [isRefreshing, setIsRefreshing] = useState(true)
  const [estadoSelecionado, setEstado] = useState<any>(null)
  const [cidadeSelecionada, setCidade] = useState<any>(null)
  const [dadosPerfil, setDadosPerfil] = useState<DadosPerfil | null>(null)


  async function getProdutos() {
    setProdutos([])
    setIsRefreshing(true)
    const jsonValue = await AsyncStorage.getItem('infos-user')
    if (jsonValue) {
      const newJson = JSON.parse(jsonValue)
      try {
        const headers = {
          Authorization: `Bearer ${newJson.token}`,
        }

        const jsonCidade = await AsyncStorage.getItem("cidade")
        const jsonEstado = await AsyncStorage.getItem('estado')

        if (jsonCidade && jsonEstado) {
          setProdutos([])
          const atualCidade = JSON.parse(jsonCidade)
          const atualEstado = JSON.parse(jsonEstado)
          setEstado(atualEstado)
          setCidade(atualCidade)
          const response = await api.get(`/cupons?estado=${atualEstado.sigla}&cidade=${atualCidade.nome}`, { headers })
          setProdutos(response.data.results)
        } else {
          const response = await api.get(`/cupons`, { headers })
          setProdutos(response.data.results)
          setEstado(null)
          setCidade(null)
        }

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
      const raw = response.data?.results ?? response.data
      setCategorias(Array.isArray(raw) ? raw : [])
    } catch (error: any) {
      console.log('ERROR Categorias: ', error?.response?.data)
      setCategorias([])
    }
    setIsRefreshing(false)
  }

  /** L `dados-perfil` + `infos-user` para atualizar chip Discontoken sem esperar a API. */
  async function aplicarDadosPerfilDoStorage() {
    try {
      const dp = await AsyncStorage.getItem('dados-perfil')
      const iu = await AsyncStorage.getItem('infos-user')
      const u = iu ? JSON.parse(iu) : {}
      if (dp) {
        const p = JSON.parse(dp) as DadosPerfil
        setDadosPerfil({
          ...p,
          associacao_id: p.associacao_id ?? u.associacao_id ?? null,
          discotoken: p.discotoken ?? u.discotoken ?? null,
        })
      } else if (iu) {
        setDadosPerfil({
          associacao_id: u.associacao_id ?? null,
          discotoken: u.discotoken ?? null,
        })
      }
    } catch {
      /* ignore */
    }
  }

  async function getDadosPerfil() {
    setIsRefreshing(true)
    const jsonValue = await AsyncStorage.getItem('infos-user')

    if (jsonValue) {
      const newJson = JSON.parse(jsonValue)
      try {
        const response = await api.get(`/perfil/pessoa-fisica/${newJson?.id}`)
        const results = response.data.results as DadosPerfil & { nome_completo?: string }
        setPrimeiroNome(
          (results.nome_completo ?? results.nome ?? '').split(' ')[0] ?? ''
        )
        const merged: DadosPerfil = {
          ...results,
          associacao_id:
            results.associacao_id ?? newJson.associacao_id ?? null,
          discotoken: results.discotoken ?? newJson.discotoken ?? null,
        }
        setDadosPerfil(merged)
        await AsyncStorage.setItem('dados-perfil', JSON.stringify(merged))
      } catch (error: any) {
        console.error('GET Dados Perfil (Cliente): ', error.response.data.message)
        const dp = await AsyncStorage.getItem('dados-perfil')
        if (dp) {
          setDadosPerfil(JSON.parse(dp))
        } else {
          setDadosPerfil({
            associacao_id: newJson.associacao_id ?? null,
            discotoken: newJson.discotoken ?? null,
          })
        }
      }
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
        id_oferta={item.id}
        dados_gerais={item}
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

  const limparFiltroCidadeEstado = async () => {
    await AsyncStorage.removeItem('cidade')
    await AsyncStorage.removeItem('estado')
    setEstado(null)
    setCidade(null)
    getProdutos()
  }

  useEffect(() => {
    if (!isFocused) return
      ; (async () => {
        await aplicarDadosPerfilDoStorage()
        getCategorias()
        getProdutos()
        getDadosPerfil()
      })()
  }, [isFocused])

  return (
    <MainLayoutAutenticado notScroll={true} loading={isRefreshing}>
      <SafeAreaView style={{ flex: 1, marginTop: 72 }} edges={['left', 'right']}>

        <ScrollView
          horizontal
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          className="w-full mb-2"
          style={{ marginTop: 4, flexGrow: 0 }}
          contentContainerStyle={{ alignItems: 'center', paddingRight: 8, paddingVertical: 4 }}
        >
          {temDiscontokenNoPerfil(dadosPerfil) && (
            <CardCategoria
              ativo={false}
              titulo="Discontoken"
              slug="discontoken-teste"
              onPress={() => navigate('Discontoken')}
            />
          )}
          {listacategorias.map((categoria: any) => (
            <CardCategoria
              ativo={false}
              key={String(categoria.id)}
              slug={String(categoria.id)}
              titulo={categoria.categorias}
              onPress={() => navigate('Categorias', { idCategoria: categoria.id })}
            />
          ))}
        </ScrollView>

        <View className="flex-row">
          <Text className="text-[24px] font-semibold text-[#000] mb-3">Boas-vindas, {primeiroNome ?? ''} ??</Text>
        </View>

        {estadoSelecionado && cidadeSelecionada &&
          <TouchableOpacity
            onPress={() => navigate('FiltroCidadeScreen')}
            className='ml-2 mt-2 px-4 py-3 rounded-2xl bg-[#E6F3FF] border border-[#1E90FF] flex-row items-center'
          >
            <Text className="text-[18px] mr-2">??</Text>
            <View>
              <Caption fontSize={12} fontWeight={'400'} color="#1E4B79">
                Ofertas filtradas para
              </Caption>
              <Caption fontSize={14} fontWeight={'700'} color="#0B2340">
                {cidadeSelecionada.nome} - {estadoSelecionado.sigla}
              </Caption>
            </View>
          </TouchableOpacity>
        }
        {listaprodutos.length >= 1 &&
          <FlatList
            data={listaprodutos}
            className="flex-1"
            renderItem={renderItem}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
              />
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: insets.bottom + 96 }}
          />}
        {!isRefreshing && listaprodutos.length <= 0 &&
          <View className='w-full items-center'>
            <CardNotFound titulo='No encontramos cupons no momento para voc' />
            {estadoSelecionado && cidadeSelecionada && (
              <View className='mt-3 w-full px-8'>
                <ButtonOutline title='Limpar filtro de cidade e estado' onPress={limparFiltroCidadeEstado} />
              </View>
            )}
            <View className='mt-3 mx-8'>
              <ButtonOutline title='Sugerir estabelecimentos' onPress={() => navigate('SugerirEstabelecimentosScreen')} />
            </View>
          </View>
        }
      </SafeAreaView>
    </MainLayoutAutenticado>
  );
}

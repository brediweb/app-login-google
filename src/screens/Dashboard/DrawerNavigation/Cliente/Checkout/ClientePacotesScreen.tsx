import { View, ScrollView, RefreshControl } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { api } from '../../../../../service/api'
import { useIsFocused } from '@react-navigation/native'
import H3 from '../../../../../components/typography/H3'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useGlobal } from '../../../../../context/GlobalContextProvider'
import HeaderPrimary from '../../../../../components/header/HeaderPrimary'
import CardPacote from '../../../../../components/cards/Cliente/CardPacote'
import MainLayoutAutenticado from '../../../../../components/layout/MainLayoutAutenticado'

export default function ClientePacotesScreen() {
  const isFocused = useIsFocused()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [listaplanos, setListaPlanos] = useState([])
  const { statusTesteGratis, setStatusTesteGratis } = useGlobal()

  const carregarPacotes = useCallback(async (opts?: { pull?: boolean }) => {
    const pull = opts?.pull === true
    if (pull) setRefreshing(true)
    else setLoading(true)

    const jsonValue = await AsyncStorage.getItem('infos-user')
    if (!jsonValue) {
      if (pull) setRefreshing(false)
      else setLoading(false)
      return
    }

    const newJson = JSON.parse(jsonValue)
    const headersAuth = { Authorization: `Bearer ${newJson.token}` }
    const headersPacotes = {
      ...headersAuth,
      'Content-Type': 'multipart/form-data',
    }

    try {
      const response = await api.get(`/pacotes`, { headers: headersPacotes })
      setListaPlanos(response.data.results ?? [])
    } catch (error: any) {
      console.log('ERROR Lista Pacotes: ', error)
    }
    try {
      const response = await api.post(`/verifiaca-teste-gratis`, {}, {
        headers: headersAuth,
      })
      const disponivel = response.data.results?.pacote_disponivel
      setStatusTesteGratis(disponivel)
    } catch (error: any) {
      console.log('ERROR Pacote Gratuito: ', error?.response?.data?.message)
    }
    if (pull) setRefreshing(false)
    else setLoading(false)
  }, [setStatusTesteGratis])

  const onRefresh = useCallback(() => {
    void carregarPacotes({ pull: true })
  }, [carregarPacotes])

  useEffect(() => {
    void carregarPacotes()
  }, [statusTesteGratis])

  useEffect(() => {
    void carregarPacotes()
  }, [isFocused])

  return (
    <MainLayoutAutenticado
      notScroll
      marginTop={0}
      marginHorizontal={0}
      loading={loading}
    >
      <HeaderPrimary titulo='Selecionar pacotes' />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className='mx-7 mt-5 min-h-full'>
          {listaplanos && [...listaplanos]
            .sort((a: any, b: any) => {
              const parseValor = (valor: string) => parseFloat(String(valor).replace(',', '.'))
              const prioridade = (item: any) => {
                if (item.id === 4) return 0
                if (item.id === 17) return 1
                if (parseValor(item.valor) <= 0) return 2
                return 3
              }
              return prioridade(a) - prioridade(b)
            })
            .map((item: any, index: any) => (
            <View key={index}>
              {item.status != 0 &&
                <CardPacote
                  props={item}
                  valor={item.valor}
                  titulo={item.titulo}
                  beneficios={item.inclusoes_plano}
                  observacao={item.descricao_completa}
                  plano_free_usado={item.id === 4 && item.utilizou_plano_gratuito}
                />
              }
            </View>
          ))}
          {!loading && listaplanos.length <= 0 &&
            <H3>Nenhum pacote encontrado, em breve teremos novidades !</H3>
          }
        </View>
      </ScrollView>
    </MainLayoutAutenticado>
  );
}

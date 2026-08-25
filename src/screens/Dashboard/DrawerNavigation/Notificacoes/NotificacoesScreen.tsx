import { useEffect, useState } from 'react'
import { api } from '../../../../service/api'
import H3 from '../../../../components/typography/H3'
import { useIsFocused } from '@react-navigation/native'
import { useNavigate } from '../../../../hooks/useNavigate'
import AsyncStorage from '@react-native-async-storage/async-storage'
import CardNotificacao from '../../../../components/cards/CardNotificacao'
import MainLayoutAutenticado from '../../../../components/layout/MainLayoutAutenticado'
import React from 'react';
import { View } from 'react-native'

interface PropsNotificacao {
  id: string
  hora: string
  data: string
  titulo: string
  descricao: string
  visualizado: boolean
}

export default function NotificacoesScreen() {
  const isFocused = useIsFocused()
  const { navigate } = useNavigate()
  const [loading, setLoading] = useState(true)
  const [listaNotificacao, setListaNotificacao] = useState([])

  async function getNotificacoes() {
    setLoading(true)
    const jsonValue = await AsyncStorage.getItem('infos-user')
    if (jsonValue) {
      const newJson = JSON.parse(jsonValue)
      try {
        const headers = {
          Authorization: `Bearer ${newJson.token}`,
        }
        const response = await api.get(`/notificacoes`, { headers })
        setListaNotificacao(response.data.results)
      } catch (error: any) {
        console.error('ERRO GET Notificações: ', error)
      }
    }
    setLoading(false)
  }

  useEffect(() => {
    getNotificacoes()
  }, [isFocused])

  return (
    <MainLayoutAutenticado>
      <View className='w-full mt-20' />

      {listaNotificacao &&
        [...listaNotificacao]
          .sort((a: PropsNotificacao, b: PropsNotificacao) => {
            // data no formato 'DD/MM/YYYY' e hora 'HH:mm'
            try {
              // Validação para item A
              if (!a || !a.data || !a.hora || typeof a.data !== 'string' || typeof a.hora !== 'string') return 0
              const dataPartsA = a.data.split('/')
              const horaPartsA = a.hora.split(':')

              if (dataPartsA.length !== 3 || horaPartsA.length !== 2) return 0

              const [diaA, mesA, anoA] = dataPartsA.map(Number)
              const [horaA, minutoA] = horaPartsA.map(Number)

              if (isNaN(diaA) || isNaN(mesA) || isNaN(anoA) || isNaN(horaA) || isNaN(minutoA)) return 0

              const dateA = new Date(anoA, mesA - 1, diaA, horaA, minutoA)
              if (!dateA || !(dateA instanceof Date) || isNaN(dateA.getTime())) return 0

              // Validação para item B
              if (!b || !b.data || !b.hora || typeof b.data !== 'string' || typeof b.hora !== 'string') return 0
              const dataPartsB = b.data.split('/')
              const horaPartsB = b.hora.split(':')

              if (dataPartsB.length !== 3 || horaPartsB.length !== 2) return 0

              const [diaB, mesB, anoB] = dataPartsB.map(Number)
              const [horaB, minutoB] = horaPartsB.map(Number)

              if (isNaN(diaB) || isNaN(mesB) || isNaN(anoB) || isNaN(horaB) || isNaN(minutoB)) return 0

              const dateB = new Date(anoB, mesB - 1, diaB, horaB, minutoB)
              if (!dateB || !(dateB instanceof Date) || isNaN(dateB.getTime())) return 0

              return dateB.getTime() - dateA.getTime()
            } catch (error) {
              console.error('Erro ao ordenar notificações:', error)
              return 0
            }
          })
          .map((item: PropsNotificacao, index: number) => (
            <CardNotificacao
              key={`${item.id}-${index}`}
              titulo={item.data}
              descricao={item.titulo}
              visualizado={item.visualizado}
              onPress={() => navigate('NotificacoesDetalhesScreen', { id: item.id })} id={''} data={''} hora={''} />
          ))}

      {listaNotificacao.length === 0 && !loading &&
        <H3 align={"center"}>Nenhuma notificação encontrada</H3>
      }
    </MainLayoutAutenticado>
  );
}

import { api } from '../../../service/api'
import { useEffect, useState } from 'react'
import H2 from '../../../components/typography/H2'
import { Text, View, ScrollView } from 'react-native'
import CardAvaliacao from '../../../components/cards/CardAvaliacao'
import CardAvaliacaoEstrelas from '../../../components/cards/CardAvaliacaoEstrelas'
import MainLayoutAutenticado from '../../../components/layout/MainLayoutAutenticado'
import CardAvaliacaoEstrelasGeral from '../../../components/cards/CardAvaliacaoEstrelasGeral'

interface IPropsAvaliacoes {
  id: number
  data: string
  usuario: string
  avaliacao: number
}
interface IAvalicaoes {
  id: number
  media: number
  total: number
  total_noventa_dias: number
  avaliacoes: [IPropsAvaliacoes]
}

export default function ListaAvaliacaoScreen({ route }: any) {
  const id = route.params.id_anunciante
  const [listaAvaliacoes, setListaAvaliacoes] = useState<IAvalicaoes>()

  async function getAvaliacoes() {
    try {
      const response = await api.get(`/avaliacoes/${id}`)
      setListaAvaliacoes(response.data.results)
    } catch (error: any) {
      console.error('Erro Listagem de Avaliações: ', error.response.data)
    }
  }

  useEffect(() => {
    getAvaliacoes()
  }, [])

  return (
    <MainLayoutAutenticado>
      <View className='mx-4'>
        <View className='flex-1 items-center mt-6'>
          <CardAvaliacaoEstrelas estrelas={listaAvaliacoes?.media ?? 1} />
          <H2 title={listaAvaliacoes?.media?.toString() ?? '0'} />
          <CardAvaliacaoEstrelasGeral estrelas={listaAvaliacoes?.media ?? 0} />
          <View className='flex-row items-center'>
            <Text className='text-xs'>{listaAvaliacoes?.total ?? '0'} avaliações no total • </Text>
            <Text className='text-xs text-[#ADAAAF]'>{listaAvaliacoes?.total_noventa_dias ?? '0'} nos últimos 90 dias</Text>
          </View>
        </View>

        <ScrollView className='mt-4 mb-4'>
          {listaAvaliacoes?.avaliacoes.map((item: IPropsAvaliacoes) => (
            <CardAvaliacao
              key={item.id}
              data={item.data}
              media={item.avaliacao}
              title={item.usuario}
            />
          ))}
        </ScrollView >
      </View>
    </MainLayoutAutenticado>
  );
}

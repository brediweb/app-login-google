import { Alert, Modal, ScrollView, Text, View } from 'react-native'
import { useEffect, useState } from 'react'
import { api } from '../../../../../service/api'
import { colors } from '../../../../../styles/colors'
import { useIsFocused } from '@react-navigation/native'
import H3 from '../../../../../components/typography/H3'
import H1 from '../../../../../components/typography/H1'
import Caption from '../../../../../components/typography/Caption'
import AsyncStorage from '@react-native-async-storage/async-storage'
import HeaderPrimary from '../../../../../components/header/HeaderPrimary'
import CardConsumo from '../../../../../components/cards/Cliente/CardConsumo'
import MainLayoutAutenticado from '../../../../../components/layout/MainLayoutAutenticado'
import Paragrafo from '@components/typography/Paragrafo'
import { createNumberMask } from 'react-native-mask-input'
import { format } from 'date-fns'
import FilledButton from '@components/buttons/FilledButton'
import H2 from '@components/typography/H2'
import InputOutlined from '@components/forms/InputOutlined'

interface PropsItem {
  created_at: any
  data_cancelamento: any
  id: any
  interval: string
  motivo_cancelamento: any
  next_billing_at: string
  payment_method: string
  plano_id: any
  plano_nome: string
  pode_cancelar: false,
  status: string
  valor_assinatura: string
}

interface ProspsAssinatura {
  assinaturas: [
    PropsItem
  ]
}

export default function ClienteAssinaturaScreen() {
  const [loading, setLoading] = useState(true)
  const isFocused = useIsFocused()

  const [motivoCancelamento, setMotivoCancelamento] = useState('')
  const [modal, setModal] = useState(false)
  const [idAssinatura, setidAssinatura] = useState(0)
  const [error, setError] = useState(false)
  const [dadosAssinatura, setDadosAssinatura] = useState<ProspsAssinatura>()

  async function getAssinaturas() {
    setLoading(true)
    try {
      const jsonValue = await AsyncStorage.getItem('infos-user')
      if (jsonValue) {
        const newJson = JSON.parse(jsonValue)
        const headers = {
          Authorization: `Bearer ${newJson.token}`
        }
        const response = await api.get(`/pagamento/assinatura/minhas`, { headers })
        setDadosAssinatura(response.data.results)
      }
    } catch (error: any) {
      console.error('ERROR GET - Assinatura Ativa', error.response.data)
    }
    setLoading(false)
  }

  async function postCancelaAssinatura() {
    if (!idAssinatura) {
      setError(true)
      setModal(false)
      Alert.alert('Verifique sua conexão !')

      return
    }
    if (!motivoCancelamento || motivoCancelamento.length < 5) {
      setError(true)
      setModal(false)
      Alert.alert('Informe um motivo do cancelamento')
      return
    }
    const formdata = {
      assinatura_id: idAssinatura,
      motivo_cancelamento: motivoCancelamento
    }
    setLoading(true)
    try {
      const jsonValue = await AsyncStorage.getItem('infos-user')
      if (jsonValue) {
        const newJson = JSON.parse(jsonValue)
        const headers = {
          Authorization: `Bearer ${newJson.token}`
        }
        const response = await api.delete(`/pagamento/assinatura/cancelar`, {
          headers,
          data: formdata
        })

      }
    } catch (error: any) {
      setError(true)
      Alert.alert('Ops', 'Ocorreu algum erro inesperado')
      console.error('ERROR GET - Assinatura Ativa', error.response.data)
    }
    setLoading(false)
  }

  function dataFormatada(dataPura: any) {
    const dataOriginal = new Date(dataPura);
    return format(dataOriginal, 'dd/MM/yyyy');
  }

  function abrirModal(id: number) {
    setidAssinatura(id)
    setModal(!modal)
  }

  useEffect(() => {
    if (isFocused) {
      getAssinaturas()
    }
  }, [isFocused])

  return (
    <MainLayoutAutenticado marginTop={0} marginHorizontal={0} loading={loading}>
      <HeaderPrimary titulo='Assinaturas ativas' />
      <Modal
        visible={modal}
        transparent
        animationType="slide"
        onRequestClose={() => setMotivoCancelamento('')}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}
            keyboardShouldPersistTaps="handled"
          >
            <View style={{ backgroundColor: '#fff', padding: 24, borderRadius: 12, width: '85%' }}>
              <H2 title="Motivo do Cancelamento" />
              <View style={{ height: 12 }} />
              <Text
                style={{
                  fontSize: 14,
                  color: colors.gray,
                  marginBottom: 8,
                }}
              >
                Por favor, informe o motivo do cancelamento:
              </Text>

              <InputOutlined
                label='Informe o motivo'
                keyboardType={'default'}
                value={motivoCancelamento}
                onChange={setMotivoCancelamento as any}
                placeholder="Informe o motivo"
              />
              <View style={{ rowGap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
                <FilledButton
                  title="Cancelar"
                  backgroundColor={colors.gray}
                  color={colors.white}
                  border
                  borderColor={colors.gray}
                  onPress={() => setModal(false)}
                />
                <FilledButton
                  title="Confirmar"
                  backgroundColor={colors.error40}
                  color="#fff"
                  onPress={postCancelaAssinatura}
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
      <View className='mx-7 mt-5 min-h-full'>
        <View className="mt-3">
          {dadosAssinatura && dadosAssinatura.assinaturas
            .slice() // cria uma cópia para não mutar o original
            .sort((a, b) => Number(b.id) - Number(a.id)) // ordena do maior para o menor ID
            .map((item: PropsItem) => (
              <View
                key={item.id}
                className="mt-2 border-solid border-2 px-2 py-4 rounded-xl"
                style={{ borderColor: colors.secondary70 }}
              >
                <H1 fontWeight={'bold'} fontsize={16} title={`ID: ${item.id}`} />
                <View className='w-full h-1' />
                <H1 fontWeight={'bold'} fontsize={16} title={`Valor:`} />
                <Paragrafo title={`R$ ${item.valor_assinatura}`} />
                {item.pode_cancelar === false &&
                  <>
                    <H1 fontWeight={'bold'} fontsize={16} title={`Data de Cancelamento:`} />
                    <Paragrafo title={item.data_cancelamento ? dataFormatada(item.data_cancelamento) : '-'} />
                    <View className='w-full h-1' />
                    <H1 fontWeight={'bold'} fontsize={16} title={`Motivo do Cancelamento:`} />
                    <Paragrafo title={item.motivo_cancelamento || '-'} />
                  </>
                }
                <View className='w-full h-1' />
                <H1 fontWeight={'bold'} fontsize={16} title={`Plano:`} />
                <Paragrafo title={item.plano_nome || '-'} />
                {item.pode_cancelar &&
                  <>
                    <View className='w-full h-8' />
                    <FilledButton title='Cancelar Assinatura' border backgroundColor={'transparent'} borderColor={colors.error40} color={colors.error40} onPress={() => abrirModal(item.id)} />
                  </>
                }
              </View>
            ))}
          {dadosAssinatura && dadosAssinatura?.assinaturas?.length <= 0 &&
            <Text style={{
              fontSize: 16,
              textAlign: 'center'
            }}>
              Não possui assinaturas ativas ou histórico delas
            </Text>
          }
        </View>
      </View>
    </MainLayoutAutenticado >
  );
}

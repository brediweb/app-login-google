import { useState } from 'react'
import { api } from '../../../service/api'
import Toast from 'react-native-toast-message'
import H3 from '../../../components/typography/H3'
import { useNavigate } from '../../../hooks/useNavigate'
import InputArea from '../../../components/forms/InputArea'
import RadioButton from '../../../components/forms/RadioButton'
import Paragrafo from '../../../components/typography/Paragrafo'
import { Image, View, TouchableOpacity, Alert } from 'react-native'
import FilledButton from '../../../components/buttons/FilledButton'
import AsyncStorage from '@react-native-async-storage/async-storage'
import MainLayoutAutenticado from '../../../components/layout/MainLayoutAutenticado'
import { ScrollView } from 'react-native-gesture-handler'
import React from 'react'

export default function AvaliacaoScreen({ route }: { route?: any }) {
  const { goBack } = useNavigate()
  const id_oferta = route?.params.id_oferta
  const [mensagem, setMensagen] = useState('')
  const [loading, setLoading] = useState(false)
  const [contato, setContato] = useState<boolean | any>()
  const [contatoMarcado, setContatoMarcado] = useState('')
  const [selecionaAvalaicao, setSelecionaAvalaicao] = useState('')

  function resolverAnuncianteId() {
    const params = route?.params
    if (!params) return undefined
    if (Array.isArray(params)) {
      return params[0]?.anunciante_id ?? params[0]?.id_anunciante
    }
    return (
      params.id_anunciante ??
      params.anunciante_id ??
      params.anuncianteId ??
      params[0]?.anunciante_id
    )
  }

  async function onSubmit() {
   
    if (!selecionaAvalaicao) {
      Alert.alert('Erro', 'Selecione uma avaliação')
      return
    }

    if (contato === null || contato === undefined) {
      Alert.alert('Erro', 'Informe se permite contato')
      return
    }

    const anuncianteId = resolverAnuncianteId()
    if (!anuncianteId && !id_oferta) {
      Alert.alert('Erro', 'Não foi possível identificar o anunciante')
      return
    }

    setLoading(true)
    try {
      const jsonValue = await AsyncStorage.getItem('infos-user')
      if (!jsonValue) {
        Toast.show({
          type: 'error',
          text1: 'Sessão expirada. Faça login novamente.',
        })
        return
      }

      const newJson = JSON.parse(jsonValue)
      const headers = {
        Authorization: `Bearer ${newJson.token}`,
      }
      const formData = {
        anunciante_id: anuncianteId ?? id_oferta,
        comentario: mensagem.length <= 1 ? 'Sem comentários' : mensagem,
        avaliacao: selecionaAvalaicao,
        permissao_contato: contato,
      }

      const response = await api.post(`/avaliacoes/post`, formData, { headers })
      setMensagen('')
      setContato(null)
      setContatoMarcado('')
      setSelecionaAvalaicao('')
      Toast.show({
        type: 'success',
        text1: response.data.message ?? 'Avaliação realizada com sucesso',
      })
      goBack()
    } catch (error: any) {
      const mensagemErro =
        error?.response?.data?.message ?? 'Erro ao enviar avaliação'
      Toast.show({
        type: 'error',
        text1: mensagemErro,
      })
      console.error('ERRR avaliações: ', error?.response?.data ?? error)
    } finally {
      setLoading(false)
    }
  }

  const handleContato = (option: string) => {
    if (option === 'Sim') {
      setContato(true)
      setContatoMarcado('Sim')
    } else {
      setContato(false)
      setContatoMarcado('Não')
    }
  }

  return (
    <MainLayoutAutenticado loading={loading}>
      <View className='mx-4 pb-20 pt-[20%]'>
        <ScrollView
          contentContainerStyle={{ flex: 1, paddingBottom: 320 }}
        >
          <H3>Avalie a sua experiência</H3>
          <Paragrafo title='O que você achou da sua experiência com o anunciante ?' />

          <View className='flex-1 flex-row  justify-between mt-6'>
            <TouchableOpacity onPress={() => setSelecionaAvalaicao('1')}>
              {selecionaAvalaicao === '1' ?
                <View className='bg-[#D9D9D9] rounded-full p-2'>
                  <Image className='' source={require('../../../../assets/img/icons/avalia-1.png')} />
                </View>
                : <Image source={require('../../../../assets/img/icons/avalia-1.png')} />
              }
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSelecionaAvalaicao('2')}>
              {selecionaAvalaicao === '2' ?
                <View className='bg-[#D9D9D9] rounded-full p-2'>
                  <Image className='' source={require('../../../../assets/img/icons/avalia-2.png')} />
                </View>
                : <Image source={require('../../../../assets/img/icons/avalia-2.png')} />
              }
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSelecionaAvalaicao('3')}>
              {selecionaAvalaicao === '3' ?
                <View className='bg-[#D9D9D9] rounded-full p-2'>
                  <Image className='' source={require('../../../../assets/img/icons/avalia-3.png')} />
                </View>
                : <Image source={require('../../../../assets/img/icons/avalia-3.png')} />
              }
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSelecionaAvalaicao('4')}>
              {selecionaAvalaicao === '4' ?
                <View className='bg-[#D9D9D9] rounded-full p-2'>
                  <Image className='' source={require('../../../../assets/img/icons/avalia-4.png')} />
                </View>
                : <Image source={require('../../../../assets/img/icons/avalia-4.png')} />
              }
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSelecionaAvalaicao('5')}>
              {selecionaAvalaicao === '5' ?
                <View className='bg-[#D9D9D9] rounded-full p-2'>
                  <Image className='' source={require('../../../../assets/img/icons/avalia-5.png')} />
                </View>
                : <Image source={require('../../../../assets/img/icons/avalia-5.png')} />
              }
            </TouchableOpacity>
          </View>

          <View className='mt-4 mb-4'>
            <Paragrafo title='Tem algo que você queira compartilhar com a gente sobre a sua experiência ?' />
            <InputArea
              mt={2}
              height={120}
              value={mensagem}
              keyboardType={'default'}
              onChange={(text: string) => setMensagen(text)}
            />
          </View >

          <Paragrafo title='Você permite que os nossos consultores entrem em contato para saber mais sobre a sua resposta?' />
          <View className='mt-2'></View>

          <RadioButton
            options={['Sim', 'Não']}
            selectedOption={contatoMarcado}
            onSelectOption={handleContato}
          />
          <View className='mt-4'></View>
          <FilledButton
            title='Enviar'
            onPress={onSubmit}
            disabled={contato === null || selecionaAvalaicao.length <= 0 ? true : false}
          />
        </ScrollView>
      </View>
    </MainLayoutAutenticado>
  );
}

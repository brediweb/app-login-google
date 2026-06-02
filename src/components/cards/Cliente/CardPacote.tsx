import Loading from '../../Loading'
import H1 from '../../typography/H1'
import H3 from '../../typography/H3'
import React, { useState } from 'react'
import { api } from '../../../service/api'
import Caption from '../../typography/Caption'
import Toast from 'react-native-toast-message'
import { colors } from '../../../styles/colors'
import FilledButton from '../../buttons/FilledButton'
import ModalTemplate from '../../Modals/ModalTemplate'
import ButtonOutline from '../../buttons/ButtonOutline'
import { useNavigate } from '../../../hooks/useNavigate'
import { Text, View, Image, ScrollView } from 'react-native'
import RemoveCaracteres from '../../forms/RemoveCaracteres'
import { useGlobal } from '../../../context/GlobalContextProvider'
import AsyncStorage from '@react-native-async-storage/async-storage'

interface PropsBeneficiosPacote {
  id: any,
  titulo: string
}

interface PropsPacote {
  props: any
  valor: string
  titulo: string
  beneficios: any
  observacao: string
  plano_free_usado: boolean
}

export default function CardPacote({ titulo, beneficios, observacao, valor, props, plano_free_usado }: PropsPacote) {
  const { navigate } = useNavigate()
  const { setStatusTesteGratis } = useGlobal()
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)

  const handleOpenModal = () => {
    setModalVisible(true)
  }

  const handleCloseModal = () => {
    setModalVisible(false)
  }

  function fomataPequenaObservacao(textoCompleto: string) {
    const minhaString = textoCompleto;
    const limiteCaracteres = 120;

    let textoReduzido = minhaString.slice(0, limiteCaracteres);

    if (minhaString.length > limiteCaracteres) {
      return textoReduzido += "...";
    } else {
      return minhaString
    }
  }

  async function onSubmit() {
    setLoading(true)

    const jsonUsuario = await AsyncStorage.getItem('infos-user')
    const jsonPerfil = await AsyncStorage.getItem('dados-perfil')

    if (jsonPerfil && jsonUsuario) {
      const newJsonUsuario = JSON.parse(jsonUsuario)
      const newJsonPerfil = JSON.parse(jsonPerfil)
      const novoTelefone = RemoveCaracteres({ text: newJsonPerfil.telefone })

      try {
        const headers = {
          Authorization: `Bearer ${newJsonUsuario.token}`
        }
        const response = await api.post(`/periodo-gratuito/post`, {
          cpf: newJsonPerfil.cpf_represetante,
          email: newJsonPerfil.email,
          telefone: novoTelefone
        }, {
          headers: headers
        })
        setStatusTesteGratis(false)
        navigate('ClienteTesteGratisSucessoScreen')
      } catch (error: any) {
        Toast.show({
          type: 'error',
          text1: error.response.data.message ?? 'Ocorreu um erro, tente novamente mais tarde.',
        })
        console.log('ERROR GET PACOTES: ', error.response.data)
      }
    } else {
      console.log('Dados imcompletos do usuário')
      Toast.show({
        type: 'error',
        text1: 'Ocorreu um erro, tente novamente mais tarde.',
      })
    }
    setLoading(false)
  }



  return (
    <>
      {loading &&
        <Loading />
      }
      <View
        className='rounded-lg mt-4 p-4'
        style={{
          backgroundColor: colors.primary90,
          borderWidth: 3,
          borderColor: colors.primary20,
          shadowColor: "#000000",
          marginBottom: 8,
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.25,
          shadowRadius: 1.0,
        }}>
        <H1 fontWeight={'500'} fontsize={38} title={titulo} color='#000' />
        <H1 fontWeight={'700'} fontsize={24} title={valor === '0.00' ? 'Grátis' : `R$ ${valor}`} color='#000' />

        <View className='mt-4'>
          <Caption fontSize={16}>
            O plano inclui:
          </Caption>
          {beneficios.map((item: PropsBeneficiosPacote) => (
            <View key={item.id}>
              <View className='flex-row items-center mb-0 mt-2'>
                <Image className='mr-2' source={require('../../../../assets/img/icons/check.png')} />
                <Caption fontSize={16}>
                  {item.titulo}
                </Caption>
              </View>
            </View>
          ))}

          {observacao &&
            <View className='mt-3'>
              <Caption fontSize={13}>
                {
                  fomataPequenaObservacao(observacao)
                }
              </Caption>
            </View>
          }

          <View className='mt-7'>
            {props?.id === 4 && (valor === '0.00' || parseFloat(valor) <= 0)
              ? plano_free_usado
                ? <FilledButton
                  disabled={true}
                  onPress={() => { }}
                  title='Plano gratuito utilizado'
                />
                : <FilledButton
                  title='Selecionar'
                  onPress={onSubmit}
                />
              : <FilledButton
                title='Selecionar'
                onPress={() => navigate('ClienteTipoPacoteScreen', { props })}
              />
            }
          </View>
          <View className='mt-4'>
            <ButtonOutline
              border={true}
              color={colors.secondary70}
              onPress={handleOpenModal}
              backgroundColor={'transparent'}
              title='Detalhes'
            />
            <ModalTemplate visible={modalVisible} onClose={handleCloseModal}>
              <View className=' max-h-80 '>
                <H3>Detalhes do Pacote</H3>
                <ScrollView>
                  <Text className='text-sm mt-2'>
                    {observacao}
                  </Text>
                </ScrollView>
              </View>
            </ModalTemplate>
          </View>
        </View>
      </View>
    </>
  )
}




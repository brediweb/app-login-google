import { api } from '../../service/api'
import Toast from 'react-native-toast-message'
import React, { useEffect, useState } from 'react'
import InputDisabled from '../../components/forms/InputDisabled'
import FilledButton from '../../components/buttons/FilledButton'
import InputOutlined from '../../components/forms/InputOutlined'
import ButtonPerfil from '../../components/buttons/ButtonPerfil'
import { View, KeyboardAvoidingView, Platform } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import RemoveCaracteres from '../../components/forms/RemoveCaracteres'
import InputMascaraPaper from '../../components/forms/InputMascaraPaper'
import MainLayoutAutenticado from '../../components/layout/MainLayoutAutenticado'
import { useIsFocused } from '@react-navigation/native'
import Caption from '@components/typography/Caption'

export default function PerfilScreen() {
  const isFocused = useIsFocused()
  const [cpf, setCpf] = useState('')
  const [email, setEmail] = useState('')
  const [editar, setEditar] = useState(false)
  const [loading, setLoadig] = useState(true)
  const [telefone, setTelefone] = useState('')
  const [endereco, setEndereco] = useState('')
  const [complemento, setComplemento] = useState('')
  const [nomeCompleto, setNomeCompleto] = useState('')

  async function getPerfil() {
    setLoadig(true)
    const jsonValue = await AsyncStorage.getItem('infos-user')
    if (jsonValue) {
      const newJson = JSON.parse(jsonValue)
      try {
        const response = await api.get(`/perfil/pessoa-fisica/${newJson.id}`)

        setNomeCompleto(response.data.results.nome_completo)
        setEmail(response.data.results.email)
        setEndereco(response.data.results.endereco)
        setComplemento(response.data.results.complemento)
        handleCPFMask(response.data.results.cpf)
        handlePhoneMask(response.data.results.telefone)
      } catch (error: any) {
        console.error('GET Erro Perfil', error)
      }
    }
    setLoadig(false)
  }

  async function onSubmit() {
    setLoadig(true)
    const novoTelefone = RemoveCaracteres({ text: telefone })

    const jsonValue = await AsyncStorage.getItem('infos-user')
    if (jsonValue) {
      const newJson = JSON.parse(jsonValue)
      const headers = {
        Authorization: `Bearer ${newJson.token}`
      }
      try {
        const response = await api.post(`/altera/cliente`, {
          name: nomeCompleto,
          email: email,
          telefone: novoTelefone,
          endereco: endereco,
          complemento: complemento
        }, {
          headers: headers
        })

        Toast.show({
          type: 'success',
          text1: 'Perfil atualizado !',
        })
        setEditar(false)
      } catch (error: any) {
        console.error(error)
      }
    }
    setLoadig(false)
  }

  const handlePhoneMask = (value: any) => {
    let phone = value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .replace(/(\d{4})-(\d)(\d{4})/, "$1$2-$3");
    setTelefone(phone);
  }

  const handleCPFMask = (value: any) => {
    let cpf = value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{2})$/, "$1-$2");
    setCpf(cpf);
  }

  useEffect(() => {
    getPerfil()
  }, [])

  useEffect(() => {
    getPerfil()
  }, [isFocused])

  return (
    <MainLayoutAutenticado loading={loading}>
      <View className='w-full h-20' />
      <KeyboardAvoidingView
        style={{ flex: 1, paddingBottom: 100 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View className="mb-4">
          <ButtonPerfil
            onPress={() => { }}
            title={editar ? 'Editando Perfil' : 'Perfil'}
            fontsize={24}
            image={require('../../../assets/img/icons/edit.png')}
          />
        </View>

        <Caption>
          Alteração de CPF deve ser realizada via suporte
        </Caption>

        <View className="mt-2">
          {editar ?
            <>
              <InputOutlined
                mt={8}
                label='Nome completo'
                value={nomeCompleto}
                onChange={setNomeCompleto}
                keyboardType={'default'}
              />
              <InputOutlined
                mt={8}
                label='E-mail'
                value={email}
                onChange={setEmail}
                keyboardType={'default'}
              />
              <InputMascaraPaper
                mt={8}
                onChangeText={(text: any) => handlePhoneMask(text)}
                label='Telefone (DDD)'
                maxLength={15}
                keyboardType={'number-pad'}
                value={telefone}
              />
              {/* <InputOutlined
                mt={8}
                label='Endereço'
                value={endereco}
                onChange={setEndereco}
                keyboardType={'default'}
              /> */}
              <InputOutlined
                mt={8}
                label='Complemento'
                value={complemento}
                keyboardType={'default'}
                onChange={setComplemento}
              />
              <InputDisabled
                mt={8}
                onChange={setTelefone}
                label='CPF'
                keyboardType={'default'}
                value={cpf}
              />
            </>
            :
            <>
              <InputDisabled
                mt={8}
                label='Nome completo'
                keyboardType={''}
                value={nomeCompleto}
              />
              <InputDisabled
                mt={8}
                value={email}
                label='E-mail'
                keyboardType={'default'}
              />
              <InputDisabled
                mt={8}
                label='Telefone (DDD)'
                keyboardType={''}
                value={telefone}
              />
              {/* <InputDisabled
                mt={8}
                label='Endereço'
                value={endereco}
                keyboardType={'default'}
              /> */}
              <InputDisabled
                mt={8}
                keyboardType={'default'}
                label='Complemento'
                value={complemento}
              />
              <InputDisabled
                mt={8}
                onChange={setTelefone}
                label='CPF'
                keyboardType={'default'}
                value={cpf}
              />
            </>
          }
          <View className='w-full mt-8 mb-16'>
            {editar ? (
              <FilledButton
                onPress={onSubmit}
                title='Salvar alterações'
              />
            ) : (
              <FilledButton
                onPress={() => setEditar(true)}
                title='Editar perfil'
              />
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </MainLayoutAutenticado>
  );
}

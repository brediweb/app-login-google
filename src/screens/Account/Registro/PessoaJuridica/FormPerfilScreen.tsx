import { api } from 'src/service/api'
import React, { useState } from 'react'
import RadioSimples from './RadioSimples'
import { Alert, View } from 'react-native'
import Toast from 'react-native-toast-message'
import { useNavigate } from '../../../../hooks/useNavigate'
import { useGlobal } from 'src/context/GlobalContextProvider'
import AsyncStorage from '@react-native-async-storage/async-storage'
import FilledButton from '../../../../components/buttons/FilledButton'
import HeaderPrimary from '../../../../components/header/HeaderPrimary'
import MainLayoutAutenticadoSemScroll from '../../../../components/layout/MainLayoutAutenticadoSemScroll'

export default function FormPerfilScreen({ route }: { route: any }) {
  const infoForm = route.params
  const { navigate } = useNavigate()
  const [loading, setLoading] = useState(false)
  const [selectedOptions, setSelectedOptions] = useState<any[]>([]) as any
  const categoriaIdString = JSON.stringify(selectedOptions)
  const { setSenhaUser, setTelefoneDigitado, setTipoUser } = useGlobal()

  const handleSelectOption = (options: string[]) => {
    setSelectedOptions(options)
  }

  async function onSubmit() {
    if (selectedOptions?.length <= 0) {
      Alert.alert('Atenção', 'Selecione ao menos uma categoria para continuar !')
      return
    }

    setLoading(true)
    const novaImage = { uri: infoForm?.logomarca?.path ?? '', type: 'image/.png', name: ' ' }
    const formdata = new FormData()

    formdata.append('nome_fantasia', `${infoForm.nome_fantasia}`)
    formdata.append('nome_empresarial', `${infoForm.nome_empresarial}`)
    formdata.append('cnpj', `${infoForm.cnpj}`)
    formdata.append('endereco', `${infoForm.endereco}`)
    formdata.append('estado', `${infoForm.estado}`)
    formdata.append('cidade', `${infoForm.cidade}`)
    formdata.append('cep', `${infoForm.cep}`)
    formdata.append('bairro', `${infoForm.bairro}`)
    formdata.append('rua', `${infoForm.rua}`)
    formdata.append('numero', `${infoForm.numero}`)
    formdata.append('email', `${infoForm.email}`)
    formdata.append('telefone', `${infoForm.telefone}`)
    formdata.append('nome_representante', `${infoForm.nome_represetante}`)
    formdata.append('endereco_representante', `${infoForm.endereco_represetante}`)
    formdata.append('cpf_representante', `${infoForm.cpf_represetante}`)
    formdata.append('senha', `${infoForm.senha}`)
    formdata.append('perfil_id', `${categoriaIdString}`)
    formdata.append('latitude', infoForm.latitude as any)
    formdata.append('longitude', infoForm.longitude as any)
    formdata.append('codigo_afiliado', infoForm.codigo_afiliado as any)

    if (infoForm?.logomarca) {
      if (infoForm?.logomarca?.path != undefined && infoForm?.logomarca?.path != '') {
        formdata.append('logomarca', novaImage as any)
        try {
          const response = await api.post("/cadastro/pessoa-juridica", formdata,
            { headers: { 'Content-Type': 'multipart/form-data' } })
          if (!response.data.error) {
            await AsyncStorage.setItem('dados-perfil', JSON.stringify(response.data.results))
            await AsyncStorage.setItem('user-email', infoForm?.email)
            await AsyncStorage.setItem('id-user', response.data.results.id.toString())
            setSenhaUser(infoForm?.senha)
            setTipoUser('Anunciante')
            Toast.show({
              type: 'success',
              text1: 'Cadastro realizado !',
            })

            setTelefoneDigitado(infoForm.telefone)
            navigate('ValidaCodigoScreen')
          } else {
            Toast.show({
              type: 'error',
              text1: response.data.erro.message ?? 'Ocorreu um erro, tente novamente mais tarde !',
            })
            console.error('Cadastro Pessoa Jurídica: ', response.data.erro.message)
          }
        } catch (error: any) {
          Toast.show({
            type: 'error',
            text1: error?.response?.data.message ?? 'Ocorreu um erro, tente novamente mais tarde !',
          })
          console.error('Cadastro Pessoa Jurídica2 ', error)
        }
      }
    } else {
      try {
        const response = await api.post("/cadastro/pessoa-juridica", formdata,
          { headers: { 'Content-Type': 'multipart/form-data' } })
        if (!response.data.error) {
          await AsyncStorage.setItem('user-email', infoForm?.email)
          await AsyncStorage.setItem('id-user', response.data.results.id.toString())
          await AsyncStorage.setItem('dados-perfil', JSON.stringify(response.data.results))
          setSenhaUser(infoForm?.senha)
          setTipoUser('Anunciante')
          Toast.show({
            type: 'success',
            text1: 'Cadastro realizado !',
          })

          setTelefoneDigitado(infoForm.telefone)
          navigate('ValidaCodigoScreen')
        } else {
          Toast.show({
            type: 'error',
            text1: response.data.erro.message ?? 'Ocorreu um erro, tente novamente mais tarde !',
          })
          console.error('Cadastro Pessoa Jurídica: ', response.data.erro.message)
          setLoading(false)
        }
      } catch (error: any) {
        Toast.show({
          type: 'error',
          text1: error?.response?.data.message ?? 'Ocorreu um erro, tente novamente mais tarde !',
        })
        console.error('Cadastro Pessoa Jurídica2 ', error.data)
        setLoading(false)
      }
    }
    setLoading(false)
  }

  return (
    <MainLayoutAutenticadoSemScroll marginTop={0} marginHorizontal={0} loadign={loading}>
      <HeaderPrimary titulo='Escolha seu perfil (até 3)' />
      <View className='mx-4 flex-1'>
        <RadioSimples selectedOptions={selectedOptions} onSelectOption={handleSelectOption} />
      </View>
      <View className='mx-4 mt-6'>
        <FilledButton
          title='Próximo'
          disabled={selectedOptions?.length <= 0 ? true : false}
          onPress={() => onSubmit()}
        />
      </View>
    </MainLayoutAutenticadoSemScroll>
  );
}
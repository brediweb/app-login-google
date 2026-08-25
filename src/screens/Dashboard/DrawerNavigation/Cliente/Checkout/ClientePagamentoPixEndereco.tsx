import axios from 'axios'
import { useEffect, useState } from 'react'
import Toast from 'react-native-toast-message'
import { api, api_ibge } from '../../../../../service/api'
import { colors } from '../../../../../styles/colors'
import H5 from '../../../../../components/typography/H5'
import { useNavigate } from '../../../../../hooks/useNavigate'
import InputOutlined from '../../../../../components/forms/InputOutlined'
import FilledButton from '../../../../../components/buttons/FilledButton'
import HeaderPrimary from '../../../../../components/header/HeaderPrimary'
import ModalTemplate from '../../../../../components/Modals/ModalTemplate'
import { useDadosPagamento } from '../../../../../stores/useDadosPagamento'
import InputMascaraPaper from '../../../../../components/forms/InputMascaraPaper'
import MainLayoutAutenticado from '../../../../../components/layout/MainLayoutAutenticado'
import { KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Loading from '../../../../../components/Loading'


export default function ClientePagamentoPixEndereco() {
  const [uf, setUf] = useState('')
  const { navigate } = useNavigate()
  const [cep, setCep] = useState('')
  const [numero, setNumero] = useState('')
  const [cidade, setCidade] = useState('')
  const [loading, setLoading] = useState(true)
  const [modalUf, setModalUf] = useState(false)
  const [logradouro, setLogradouro] = useState('')
  const [complemento, setComplemento] = useState('')
  const [dadosUser, setDadosUser] = useState<any>([])
  const [errorEstado, setErrorEstado] = useState(false)
  const [modalCidade, setModalCidade] = useState(false)
  const [listaCidades, setListaCidades] = useState<any>([])
  const [listaEstados, setListaEstados] = useState<any>([])
  const [estadoSelecionado, setEstadoSelecionado] = useState('')
  const { dadosPagamento, setDadosPagamento } = useDadosPagamento()


  const handleCEPChange = (text: string) => {
    const cleanedText = text.replace(/\D/g, '');

    let formattedCEP = cleanedText;
    if (cleanedText.length > 5) {
      formattedCEP = `${cleanedText.slice(0, 5)}-${cleanedText.slice(5, 8)}`;
    }

    setCep(formattedCEP);
  }

  const handleCep = () => {
    const newCep = cep.replace(/\D/g, '')
    getCEP(newCep)
  }

  async function getCEP(novoCep: any) {
    try {
      const response = await axios.get(`https://brasilapi.com.br/api/cep/v2/${novoCep}`)
      setLogradouro(response.data.street)
      setCidade(response.data.city)
      setUf(response.data.state)
      setEstadoSelecionado(response.data.state)
    } catch (error: any) {
      console.error('Error GET CEP', error)
    }
  }

  async function getEstados() {
    try {
      const response = await api_ibge.get(`/localidades/estados`)
      setListaEstados(response.data)
    } catch (error: any) {
      console.error('ERRO', error)
    }
  }

  async function getCidades() {
    try {
      const response = await api_ibge.get(`/localidades/estados/${uf}/municipios`)
      setListaCidades(response.data)
    } catch (error: any) {
      console.error('ERRO', error)
    }
  }

  async function gatData() {
    setLoading(true)
    try {
      const jsonValue = await AsyncStorage.getItem('infos-user')
      if (jsonValue) {
        const newJson = JSON.parse(jsonValue)
        setDadosUser(newJson)
      }
    } catch (error: any) {
      console.error(error)
    }
    setLoading(false)
  }

  async function getEnderecoPerfil() {
    try {
      const response = await api.get(`/perfil/pessoa-juridica/${dadosUser.id}`)
      setLogradouro(response.data.results.endereco)
    } catch (error: any) {
      console.error('ERRO Get Endereço Perfil: ', error)
    }
    setLoading(false)
  }

  function openModalCidades() {
    if (uf) {
      getCidades()
      setModalCidade(true)
    } else {
      Toast.show({
        type: 'error',
        text1: 'Selecione o seu Estado(UF) !',
      });
      setErrorEstado(true)
    }
  }

  const handleSubmit = () => {
    if (!estadoSelecionado) {
      Toast.show({
        type: 'error',
        text1: 'Selecione um estado',
      })
      return;
    }
    if (!cidade) {
      Toast.show({
        type: 'error',
        text1: 'Informe uma cidade',
      })
      return;
    }
    if (cep.length <= 7) {
      Toast.show({
        type: 'error',
        text1: 'Informe um CEP válido',
      })
      return;
    }
    if (logradouro.length <= 4) {
      Toast.show({
        type: 'error',
        text1: 'Informe um logradouro válido',
      })
      return;
    }
    if (numero.length <= 1) {
      Toast.show({
        type: 'error',
        text1: 'Informe um número válido',
      })
      return;
    }
    setDadosPagamento({
      ...dadosPagamento,
      endereco_cep: cep,
      endereco_cidade: cidade,
      endereco_numero: numero,
      endereco_cobranca: logradouro,
      endereco_uf: estadoSelecionado,
    })

    navigate('ClientePagamentoPixScreen')
  }

  useEffect(() => {
    gatData()
    getEstados()
    getEnderecoPerfil()
  }, [])

  if (loading) {
    return <Loading />
  }

  return (
    <MainLayoutAutenticado loading={loading} marginTop={0} marginHorizontal={0}>
      <ModalTemplate onClose={() => setModalUf(false)} visible={modalUf}>
        <View className=''>
          <Text className='text-xl font-bold mt-4'>Selecione o seu Estado(UF):</Text>
          <ScrollView className='w-full h-40'>
            {listaEstados && listaEstados
              .sort((a: any, b: any) => a.nome.localeCompare(b.nome))
              .map((item: any, index: any) => (
                <TouchableOpacity
                  className=' rounded-md my-1 px-2 py-2'
                  style={{
                    backgroundColor: colors.primary90
                  }}
                  key={index}
                  onPress={() => {
                    getCidades()
                    setCidade('')
                    setUf(item.sigla)
                    setModalUf(false)
                    setErrorEstado(false)
                    setEstadoSelecionado(item.nome)
                  }}
                >
                  <Text className='text-md font-semibold'>{item.nome} - ({item.sigla})</Text>
                </TouchableOpacity>
              ))
            }
          </ScrollView>
        </View>
      </ModalTemplate>

      <ModalTemplate onClose={() => setModalCidade(false)} visible={modalCidade}>
        <View className=''>
          <Text className='text-xl font-bold mt-4'>Selecione o sua cidade:</Text>
          <ScrollView className='w-full h-40'>
            {listaCidades && listaCidades
              .sort((a: any, b: any) => a.nome.localeCompare(b.nome))
              .map((item: any, index: any) => (
                <TouchableOpacity
                  className=' rounded-md my-1 pl-2 py-2'
                  style={{
                    backgroundColor: colors.primary90
                  }}
                  key={index}
                  onPress={() => {
                    setCidade(item.nome)
                    setModalCidade(false)
                  }}
                >
                  <Text className='text-md font-semibold'>{item.nome}</Text>
                </TouchableOpacity>
              ))
            }
          </ScrollView>
        </View>
      </ModalTemplate>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <HeaderPrimary voltarScreen={() => navigate('ClienteTipoPagamentoScreen')} titulo='Realizar pagamento' />
        <View className='mx-7 mt-5' >
          <View>
            <H5>Endereço de cobrança</H5>
            <View className='my-4'>
              <InputMascaraPaper
                mt={8}
                label='CEP'
                required
                value={cep}
                keyboardType={'number-pad'}
                onChangeText={handleCEPChange}
                onBlur={handleCep}
              />
              <View className='w-full mt-4'>
                <TouchableOpacity onPress={() => setModalUf(true)}>
                  <View
                    style={{ borderColor: errorEstado ? '#f01' : '#49454F' }}
                    className='bg-white text-base overflow-scroll justify-center border-solid border-[1px] rounded-md h-[52px] pl-2'>
                    {uf ?
                      <Text className='text-[#000]'>{uf}</Text>
                      :
                      <Text style={{ color: errorEstado ? '#f01' : '#49454F' }}>UF*</Text>
                    }
                  </View>
                </TouchableOpacity>
              </View>

              <TouchableOpacity className='' onPress={openModalCidades}>
                <View className='bg-white text-base overflow-scroll justify-center border-solid border-[1px] border-[#49454F] rounded-md h-[52px] mt-3 pl-2'>
                  {cidade ?
                    <Text className='text-[#49454F]'>{cidade}</Text>
                    :
                    <Text className='text-[#49454F]'>Cidade*</Text>
                  }
                </View>
              </TouchableOpacity>
              <InputOutlined
                mt={8}
                required
                value={logradouro}
                label='Logradouro'
                keyboardType={'default'}
                onChange={setLogradouro}
              />
              <InputOutlined
                mt={8}
                required
                label='Número'
                keyboardType={'number-pad'}
                onChange={setNumero}
              />
              <InputOutlined
                mt={8}
                label='Complemento'
                keyboardType={'default'}
                onChange={setComplemento}
              />
            </View>
          </View>
          <FilledButton
            title='Próximo'
            disabled={cep.length <= 0 || logradouro.length <= 0 || numero.length <= 0 || complemento.length <= 0 ? true : false}
            onPress={handleSubmit}
          />
        </View>
      </KeyboardAvoidingView>
    </MainLayoutAutenticado>
  );
}
import axios from 'axios'
import React, { useEffect, useMemo, useState } from 'react'
import Toast from 'react-native-toast-message'
import { colors } from '../../../../../styles/colors'
import H5 from '../../../../../components/typography/H5'
import { api, api_ibge } from '../../../../../service/api'
import { useNavigate } from '../../../../../hooks/useNavigate'
import AsyncStorage from '@react-native-async-storage/async-storage'
import FilledButton from '../../../../../components/buttons/FilledButton'
import InputOutlined from '../../../../../components/forms/InputOutlined'
import HeaderPrimary from '../../../../../components/header/HeaderPrimary'
import { useDadosPagamento } from '../../../../../stores/useDadosPagamento'
import ModalTemplate from '../../../../../components/Modals/ModalTemplate'
import MainLayoutAutenticado from '../../../../../components/layout/MainLayoutAutenticado'
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'


export default function ClientePagamentoEndereco() {
  const { navigate } = useNavigate()
  const [cep, setCep] = useState('')
  const [numero, setNumero] = useState('')
  const [cidade, setCidade] = useState('')
  const [uf, setUf] = useState('')
  const [modalUf, setModalUf] = useState(false)
  const [logradouro, setLogradouro] = useState('')
  const [estado, setEstado] = useState('' as string)
  const [complemento, setComplemento] = useState('')
  const [listaCidades, setListaCidades] = useState([])
  const [errorEstado, setErrorEstado] = useState(false)
  const [errorCidade, setErrorCidade] = useState(false)
  const [modalCidade, setModalCidade] = useState(false)
  const [loading, setLoading] = useState(false)
  const [listaEstados, setListaEstados] = useState<any[]>([])
  const [estadoSelecionado, setEstadoSelecionado] = useState('')
  const [buscaEstado, setBuscaEstado] = useState('')
  const [buscaCidade, setBuscaCidade] = useState('')
  const { dadosPagamento, setDadosPagamento } = useDadosPagamento()

  const estadosOrdenados = useMemo(
    () => [...listaEstados].sort((a, b) => a.nome.localeCompare(b.nome)),
    [listaEstados]
  )
  const estadosFiltrados = useMemo(
    () =>
      buscaEstado.trim()
        ? estadosOrdenados.filter(
          (e) =>
            e.nome.toLowerCase().includes(buscaEstado.toLowerCase()) ||
            e.sigla.toLowerCase().includes(buscaEstado.toLowerCase())
        )
        : estadosOrdenados,
    [estadosOrdenados, buscaEstado]
  )

  const cidadesOrdenadas = useMemo(
    () => [...listaCidades].sort((a: any, b: any) => a.nome.localeCompare(b.nome)),
    [listaCidades]
  )
  const cidadesFiltradas = useMemo(
    () =>
      buscaCidade.trim()
        ? cidadesOrdenadas.filter((c: any) =>
          c.nome.toLowerCase().includes(buscaCidade.toLowerCase())
        )
        : cidadesOrdenadas,
    [cidadesOrdenadas, buscaCidade]
  )

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
    setLoading(true)
    try {
      const response = await axios.get(`https://brasilapi.com.br/api/cep/v2/${novoCep}`)
      setLogradouro(response.data.street)
      setCidade(response.data.city)
      setUf(response.data.state)
      setEstadoSelecionado(response.data.state)
    } catch (error: any) {
      console.error('Error GET CEP V2:', error)
      // Tentativa caso a primeira API V2 falhar
      try {
        const response = await axios.get(`https://brasilapi.com.br/api/cep/v1/${novoCep}`)
        setLogradouro(response.data.street)
        setCidade(response.data.city)
        setUf(response.data.state)
        setEstadoSelecionado(response.data.state)
      } catch (errorV1: any) {
        console.error('Error GET CEP V1:', errorV1)
        Toast.show({
          type: 'error',
          text1: 'CEP não encontrado',
          text2: 'Por favor, verifique o CEP informado',
        })
        setLogradouro('')
        setCidade('')
        setUf('')
        setEstadoSelecionado('')
      }
    } finally {
      setLoading(false)
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
    if (logradouro?.length <= 4) {
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
      endereco_uf: estadoSelecionado,
      endereco_cidade: cidade,
      endereco_cep: cep,
      endereco_cobranca: logradouro,
      endereco_numero: numero,
    })
    navigate('ClienteSucessoPagamentoScreen')
  }

  async function getDadosEndereco() {
    const jsonValue = await AsyncStorage.getItem('infos-user')

    if (jsonValue) {
      const newJson = JSON.parse(jsonValue)

      try {
        const response = await api.get(`/perfil/pessoa-juridica/${newJson.id}`)
        setLogradouro(response.data.results.endereco)
      } catch (error: any) {
        console.error(error.response.data)
      }
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

  function openModalCidades() {
    if (uf) {
      setBuscaCidade('')
      getCidades()
      setModalCidade(true)
    } else {
      Toast.show({
        type: 'error',
        text1: 'Selecione o estado (UF) primeiro',
      })
      setErrorEstado(true)
    }
  }

  function openModalUf() {
    setBuscaEstado('')
    setModalUf(true)
  }

  function selecionarEstado(item: { sigla: string; nome: string }) {
    setEstado(item.nome)
    setUf(item.sigla)
    setEstadoSelecionado(item.sigla)
    setCidade('')
    setErrorEstado(false)
    setModalUf(false)
    getCidades()
  }

  function selecionarCidade(item: { nome: string }) {
    setCidade(item.nome)
    setErrorCidade(false)
    setModalCidade(false)
  }

  useEffect(() => {
    getDadosEndereco()
    getEstados()
  }, [])

  return (
    <MainLayoutAutenticado loading={loading} marginTop={0} marginHorizontal={0}>
      <ModalTemplate
        onClose={() => { }}
        closeSecondary={true}
        visible={modalUf}
        padding={16}
      >
        <View style={styles.modalBox}>
          <View style={styles.modalTitle}>
            <H5>Selecione o estado (UF)</H5>
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por estado ou sigla..."
            placeholderTextColor={colors.neutralvariant60}
            value={buscaEstado}
            onChangeText={setBuscaEstado}
          />
          <FlatList
            data={estadosFiltrados}
            keyExtractor={(item) => item.id.toString()}
            style={styles.list}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <Text style={styles.emptyText}>Nenhum estado encontrado</Text>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.item, uf === item.sigla && styles.itemSelected]}
                onPress={() => selecionarEstado(item)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.itemText,
                    uf === item.sigla && styles.itemTextSelected,
                  ]}
                >
                  {item.nome} ({item.sigla})
                </Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity
            style={styles.modalVoltarButton}
            onPress={() => {
              setModalUf(false)
              setBuscaEstado('')
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.modalVoltarText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </ModalTemplate>
      <ModalTemplate
        closeSecondary={true}
        onClose={() => {
          setModalCidade(false)
          setBuscaCidade('')
        }}
        visible={modalCidade}
        padding={16}
      >
        <View style={styles.modalBox}>
          <View style={styles.modalTitle}>
            <H5>Selecione a cidade</H5>
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por cidade..."
            placeholderTextColor={colors.neutralvariant60}
            value={buscaCidade}
            onChangeText={setBuscaCidade}
          />
          <FlatList
            data={cidadesFiltradas}
            keyExtractor={(item: any) => item.id.toString()}
            style={styles.list}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <Text style={styles.emptyText}>Nenhuma cidade encontrada</Text>
            }
            renderItem={({ item }: { item: any }) => (
              <TouchableOpacity
                style={[
                  styles.item,
                  cidade === item.nome && styles.itemSelected,
                ]}
                onPress={() => selecionarCidade(item)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.itemText,
                    cidade === item.nome && styles.itemTextSelected,
                  ]}
                >
                  {item.nome}
                </Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity
            style={styles.modalVoltarButton}
            onPress={() => {
              setModalCidade(false)
              setBuscaCidade('')
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.modalVoltarText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </ModalTemplate>
      <ScrollView>
        <HeaderPrimary voltarScreen={() => navigate('ClientePagamentoCartaoScreen')} titulo='Realizar pagamento' />
        <View className='mx-7 mt-5 flex-1 justify-between' >
          <View>
            <H5>Endereço de cobrança</H5>
            <View className='my-4'>
              <InputOutlined
                mt={8}
                label='CEP'
                required
                value={cep}
                maxLength={9}
                keyboardType='number-pad'
                onChange={handleCEPChange}
                onBlur={handleCep}
              />
              <View className='w-full mt-4'>
                <TouchableOpacity onPress={openModalUf}>
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
            title='Confirmar Pagamento'
            disabled={cep.length <= 0 || logradouro?.length <= 0 || numero.length <= 0 ? true : false}
            onPress={handleSubmit}
          />
        </View>
        <View className='w-full h-[440px]' />
      </ScrollView>
    </MainLayoutAutenticado>
  )
}

const styles = StyleSheet.create({
  modalBox: {
    minWidth: 280,
    maxHeight: 420,
  },
  modalTitle: {
    marginBottom: 12,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: colors.neutralvariant80,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.neutral10,
    marginBottom: 12,
  },
  list: {
    maxHeight: 300,
  },
  item: {
    backgroundColor: colors.primary90,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 6,
  },
  itemSelected: {
    backgroundColor: colors.primary80,
    borderWidth: 1,
    borderColor: colors.primary40,
  },
  itemText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.neutral10,
  },
  itemTextSelected: {
    fontWeight: '600',
    color: colors.primary20,
  },
  emptyText: {
    fontSize: 15,
    color: colors.neutralvariant60,
    textAlign: 'center',
    paddingVertical: 24,
  },
  modalVoltarButton: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutralvariant90,
    borderRadius: 8,
  },
  modalVoltarText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral10,
  },
})
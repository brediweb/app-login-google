import { useNavigate } from '@hooks/useNavigate'
import React, { useEffect, useState, useRef } from 'react'
import { useIsFocused } from '@react-navigation/native'
import MainLayoutAutenticado from '@components/layout/MainLayoutAutenticado'
import { Text, TouchableOpacity, View, Linking } from 'react-native'
import InputOutlined from '@components/forms/InputOutlined'
import FilledButton from '@components/buttons/FilledButton'
import RadioButton from '@components/forms/RadioButton'
import H3 from '@components/typography/H3'
import H5 from '@components/typography/H5'
import Caption from '@components/typography/Caption'
import { colors } from '../../../styles/colors'
import Toast from 'react-native-toast-message'
import { api } from '../../../service/api'
import AsyncStorage from '@react-native-async-storage/async-storage'
import LottieView from 'lottie-react-native'
import Clipboard from '@react-native-clipboard/clipboard'
import ModalTemplate from '@components/Modals/ModalTemplate'
import { Ionicons } from '@expo/vector-icons'

const TERMOS_AFILIADO_URL = 'https://discontapp.com.br/termo-de-uso-de-afiliados.pdf'

export default function CadastroAfiliadoScreen() {
  const isFocused = useIsFocused()
  const { navigate } = useNavigate()

  // Estados dos campos
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [password, setPassword] = useState('')
  const [cpf, setCpf] = useState('')
  const [banco, setBanco] = useState('')
  const [agencia, setAgencia] = useState('')
  const [contaCorrente, setContaCorrente] = useState('')
  const [tipoChavePix, setTipoChavePix] = useState('')
  const [chavePix, setChavePix] = useState('')
  const [aceiteTermos, setAceiteTermos] = useState(false)
  const [cpfPreenchido, setCpfPreenchido] = useState('')
  const [modalTermosVisible, setModalTermosVisible] = useState(false)
  const [modalValidacaoVisible, setModalValidacaoVisible] = useState(false)
  const [mensagemValidacao, setMensagemValidacao] = useState('')

  // Estados de erro
  const [errorName, setErrorName] = useState(false)
  const [errorEmail, setErrorEmail] = useState(false)
  const [errorTelefone, setErrorTelefone] = useState(false)
  const [errorPassword, setErrorPassword] = useState(false)
  const [errorCpf, setErrorCpf] = useState(false)
  const [errorBanco, setErrorBanco] = useState(false)
  const [errorAgencia, setErrorAgencia] = useState(false)
  const [errorContaCorrente, setErrorContaCorrente] = useState(false)
  const [errorTipoChavePix, setErrorTipoChavePix] = useState(false)
  const [errorChavePix, setErrorChavePix] = useState(false)
  const [errorAceiteTermos, setErrorAceiteTermos] = useState(false)

  // Estados auxiliares
  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [dadosSucesso, setDadosSucesso] = useState<any>(null)

  // Refs para navegação entre campos
  const input1Ref = useRef(null)
  const input2Ref = useRef(null)
  const input3Ref = useRef(null)
  const input4Ref = useRef(null)
  const input5Ref = useRef(null)
  const input6Ref = useRef(null)
  const input7Ref = useRef(null)
  const input8Ref = useRef(null)
  const input9Ref = useRef(null)
  const input10Ref = useRef(null)

  // Opções de tipo de chave PIX para exibição
  const tiposChavePixDisplay = ['CPF', 'E-mail', 'Telefone', 'Aleatória']

  // Mapeamento entre valores exibidos e valores da API
  const tiposChavePixMap: { [key: string]: string } = {
    'CPF': 'cpf',
    'E-mail': 'email',
    'Telefone': 'telefone',
    'Aleatória': 'aleatoria'
  }

  // Mapeamento reverso (da API para exibição)
  const tiposChavePixReverseMap: { [key: string]: string } = {
    'cpf': 'CPF',
    'email': 'E-mail',
    'telefone': 'Telefone',
    'aleatoria': 'Aleatória'
  }

  // Labels de status do afiliado para exibição
  const STATUS_LABELS: Record<string, string> = {
    nao_solicitou: 'Não solicitou',
    nao_solicitado: 'Não solicitou',
    em_validacao: 'Em validação',
    pendente: 'Em validação',
    aprovado: 'Aprovado',
    reprovado: 'Reprovado',
    suspenso: 'Suspenso'
  }

  const getStatusLabel = (status: string | undefined) => {
    if (!status) return ''
    const key = status.toLowerCase().replace(/\s/g, '_')
    return STATUS_LABELS[key] ?? status
  }

  const getStatusColor = (status: string | undefined) => {
    if (!status) return colors.warning
    const key = status.toLowerCase().replace(/\s/g, '_')
    switch (key) {
      case 'aprovado': return '#4CAF50'
      case 'reprovado': return colors.error40
      case 'suspenso': return colors.gray
      case 'nao_solicitou':
      case 'nao_solicitado':
      case 'em_validacao':
      case 'pendente':
      default: return colors.warning
    }
  }

  // Função para navegar entre inputs
  const focusNextInput = (ref: any) => {
    if (ref && ref.current) {
      ref.current.focus()
    }
  }

  // Máscara de CPF
  const handleCPFMask = (value: any) => {
    let cpfFormatted = value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{2})$/, '$1-$2')
    setCpf(cpfFormatted)
  }

  // Máscara de telefone
  const handlePhoneMask = (value: any) => {
    let phone = value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .replace(/(\d{4})-(\d)(\d{4})/, '$1$2-$3')
    setTelefone(phone)
  }

  // Máscara da chave PIX conforme o tipo selecionado (sem máscara para Aleatória)
  const handleChavePixChange = (value: string) => {
    if (tipoChavePix === 'aleatoria' || tipoChavePix === 'email' || !tipoChavePix) {
      setChavePix(value)
      return
    }
    if (tipoChavePix === 'cpf') {
      const cpfFormatted = value
        .replace(/\D/g, '')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{2})$/, '$1-$2')
      setChavePix(cpfFormatted)
      return
    }
    if (tipoChavePix === 'telefone') {
      const phone = value
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .replace(/(\d{4})-(\d)(\d{4})/, '$1$2-$3')
      setChavePix(phone)
    }
  }

  // Validação de email (formato válido)
  const validateEmail = (email: string) => {
    const trimmed = email.trim()
    if (!trimmed) return false
    // Formato: local@domínio.tld (com pelo menos um caractere em cada parte)
    const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/
    return re.test(trimmed)
  }

  // Validação de CPF (11 dígitos numéricos)
  const validateCPF = (cpf: string) => {
    const cpfNumbers = cpf.replace(/\D/g, '')
    return cpfNumbers.length === 11 && /^\d{11}$/.test(cpfNumbers)
  }

  // Validação de telefone (formato BR: 10 dígitos fixo ou 11 dígitos celular com 9 após DDD)
  const validatePhone = (phone: string) => {
    const digits = phone.replace(/\D/g, '')
    if (digits.length === 10) {
      const ddd = parseInt(digits.slice(0, 2), 10)
      return ddd >= 11 && ddd <= 99
    }
    if (digits.length === 11) {
      const ddd = parseInt(digits.slice(0, 2), 10)
      const nove = digits[2] === '9'
      return ddd >= 11 && ddd <= 99 && nove
    }
    return false
  }

  // Validação de senha
  const validatePassword = (password: string) => {
    return password.length >= 8
  }

  // Função de validação geral
  const validateForm = () => {
    let isValid = true

    // Resetar erros
    setErrorName(false)
    setErrorEmail(false)
    setErrorTelefone(false)
    setErrorPassword(false)
    setErrorCpf(false)
    setErrorBanco(false)
    setErrorAgencia(false)
    setErrorContaCorrente(false)
    setErrorTipoChavePix(false)
    setErrorChavePix(false)
    setErrorAceiteTermos(false)

    // Validar nome
    if (!name.trim()) {
      setErrorName(true)
      isValid = false
    }

    // Validar email
    if (!email.trim() || !validateEmail(email)) {
      setErrorEmail(true)
      isValid = false
    }


    // Validar senha
    if (!password || !validatePassword(password)) {
      setErrorPassword(true)
      isValid = false
    }

    // Validar CPF
    if (!cpf.trim() || !validateCPF(cpf)) {
      setErrorCpf(true)
      isValid = false
    }

    // Validar banco
    if (!banco.trim()) {
      setErrorBanco(true)
      isValid = false
    }

    // Validar agência
    if (!agencia.trim()) {
      setErrorAgencia(true)
      isValid = false
    }

    // Validar conta corrente
    if (!contaCorrente.trim()) {
      setErrorContaCorrente(true)
      isValid = false
    }

    // Validar tipo chave PIX
    if (!tipoChavePix) {
      setErrorTipoChavePix(true)
      isValid = false
    }

    // Validar chave PIX apenas conforme o tipo selecionado (não validar outros formatos)
    const tipoNormalized = tipoChavePix?.toLowerCase().replace(/\s/g, '') || ''
    let chavePixValida = false
    if (tipoChavePix && chavePix.trim()) {
      if (tipoNormalized === 'cpf') chavePixValida = validateCPF(chavePix)
      else if (tipoNormalized === 'telefone') chavePixValida = validatePhone(chavePix)
      else if (tipoNormalized === 'e-mail' || tipoNormalized === 'email') chavePixValida = validateEmail(chavePix)
      else if (tipoNormalized === 'aleatória' || tipoNormalized === 'aleatoria') chavePixValida = chavePix.trim().length > 0
      else chavePixValida = chavePix.trim().length > 0
    }
    if (!chavePixValida) {
      setErrorChavePix(true)
      isValid = false
    }

    // Validar aceite de termos
    if (!aceiteTermos) {
      setErrorAceiteTermos(true)
      isValid = false
    }

    return isValid
  }

  // Função de submit
  const handleSubmit = async () => {
    if (!validateForm()) {
      const msgEmail = !email.trim() || !validateEmail(email)
      const msgPhone = !telefone.trim() || !validatePhone(telefone)
      const msgCpf = !cpf.trim() || !validateCPF(cpf)
      const tipoNorm = tipoChavePix?.toLowerCase().replace(/\s/g, '') || ''
      let chavePixOk = false
      if (tipoChavePix && chavePix.trim()) {
        if (tipoNorm === 'cpf') chavePixOk = validateCPF(chavePix)
        else if (tipoNorm === 'telefone') chavePixOk = validatePhone(chavePix)
        else if (tipoNorm === 'e-mail' || tipoNorm === 'email') chavePixOk = validateEmail(chavePix)
        else chavePixOk = true
      }
      const msgChavePix = !chavePixOk
      let text1 = 'Por favor, preencha todos os campos corretamente.'
      const parts: string[] = []
      if (msgEmail) parts.push('E-mail: formato válido (ex: nome@dominio.com)')
      if (msgPhone) parts.push('Telefone (contato): 10 ou 11 dígitos')
      if (msgCpf) parts.push('CPF (dados pessoais): 11 dígitos')
      if (msgChavePix) {
        if (tipoNorm === 'cpf') parts.push('Chave PIX (CPF): 11 dígitos')
        else if (tipoNorm === 'telefone') parts.push('Chave PIX (Telefone): 10 ou 11 dígitos')
        else if (tipoNorm === 'e-mail' || tipoNorm === 'email') parts.push('Chave PIX (E-mail): formato válido')
        else parts.push('Chave PIX: preencha conforme o tipo selecionado')
      }
      if (parts.length > 0) text1 = parts.join('; ')
      setMensagemValidacao(text1)
      setModalValidacaoVisible(true)
      return
    }

    setLoading(true)

    try {
      // Preparar dados para envio
      const dadosAfiliado = {
        name: name.trim(),
        email: email.trim(),
        telefone: telefone.replace(/\D/g, ''),
        password: password,
        cpf: cpf.replace(/\D/g, ''),
        banco: banco.trim(),
        agencia: agencia.trim(),
        conta_corrente: contaCorrente.trim(),
        tipo_chave_pix: tiposChavePixMap[tipoChavePix] || tipoChavePix.toLowerCase(),
        chave_pix: (tipoChavePix === 'cpf' || tipoChavePix === 'telefone') ? chavePix.replace(/\D/g, '') : chavePix.trim(),
        aceite_termos: aceiteTermos,
      }

      // Verificar se há token de autenticação
      const jsonValue = await AsyncStorage.getItem('infos-user')
      let headers = {}

      if (jsonValue) {
        const userData = JSON.parse(jsonValue)
        if (userData.token) {
          headers = {
            Authorization: `Bearer ${userData.token}`,
          }
        }
      }

      // Chamada à API
      const response = await api.post('/afiliados/cadastrar', dadosAfiliado, { headers })

      // Verificar se a resposta indica sucesso
      if (response.status === 201 || response.status === 200) {
        // Verificar se há erros na resposta mesmo com status 200/201
        if (response.data.success === false || response.data.errors) {
          // Verificar erros de validação
          if (response.data.errors?.email) {
            setErrorEmail(true)
            Toast.show({
              type: 'error',
              text1: response.data.errors.email[0] || 'O campo email já está sendo utilizado.',
            })
            setLoading(false)
            return
          }

          Toast.show({
            type: 'error',
            text1: response.data.message || 'Erro ao cadastrar afiliado',
          })
          setLoading(false)
          return
        }

        // Salvar dados de sucesso e mostrar view de sucesso
        setDadosSucesso(response.data.data)
        setShowSuccess(true)

        // Limpar formulário
        setName('')
        setEmail('')
        setTelefone('')
        setPassword('')
        setCpf('')
        setBanco('')
        setAgencia('')
        setContaCorrente('')
        setTipoChavePix('')
        setChavePix('')
        setAceiteTermos(false)
      } else {
        Toast.show({
          type: 'error',
          text1: response.data.message || 'Erro ao cadastrar afiliado',
        })
        setLoading(false)
      }

    } catch (error: any) {
      console.error('Erro ao cadastrar afiliado:', error.response?.data)

      // Tratar erros de validação da API - PRIMEIRO verificar email duplicado
      if (error.response?.data?.errors?.email) {
        setErrorEmail(true)
        const emailError = error.response.data.errors.email[0] || 'O campo email já está sendo utilizado.'
        Toast.show({
          type: 'error',
          text1: emailError,
        })
        setLoading(false)
        return
      }

      // Tratar diferentes tipos de erro
      let errorMessage = 'Erro ao cadastrar afiliado'

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.response?.data?.erro) {
        errorMessage = error.response.data.erro
      } else if (error.message) {
        errorMessage = error.message
      }

      Toast.show({
        type: 'error',
        text1: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  async function getDadosAfiliado() {
    const jsonValue = await AsyncStorage.getItem('infos-user')

    if (jsonValue) {
      const userData = JSON.parse(jsonValue)

      // Preencher nome completo e email dos dados básicos
      const nomeCompleto = userData.nome && userData.sobrenome && userData.sobrenome !== '-'
        ? `${userData.nome} ${userData.sobrenome}`
        : userData.nome || ''

      if (nomeCompleto) {
        setName(nomeCompleto)
      }

      if (userData.email) {
        setEmail(userData.email)
      }

      // Buscar dados completos do perfil (CPF e telefone)
      try {
        const response = await api.get(`/perfil/pessoa-fisica/${userData.id}`)

        if (response.data.results) {
          // Preencher nome completo se não foi preenchido antes
          if (!nomeCompleto && response.data.results.nome_completo) {
            setName(response.data.results.nome_completo)
          }

          // Preencher email se não foi preenchido antes
          if (!userData.email && response.data.results.email) {
            setEmail(response.data.results.email)
          }

          // Preencher telefone
          if (response.data.results.telefone) {
            handlePhoneMask(response.data.results.telefone)
          }

          // Preencher CPF
          if (response.data.results.cpf) {
            setCpfPreenchido(response.data.results.cpf)
            handleCPFMask(response.data.results.cpf)
          }
        }
      } catch (error: any) {
        console.error('Erro ao buscar dados do perfil:', error)
        // Se não conseguir buscar do perfil, tenta usar apenas os dados básicos
      }
    }
  }

  useEffect(() => {
    if (isFocused) {
      getDadosAfiliado()
    }
  }, [isFocused])

  useEffect(() => {
    // Limpar erros quando o campo for preenchido
    if (name) setErrorName(false)
    if (email && validateEmail(email)) setErrorEmail(false)
    if (telefone && validatePhone(telefone)) setErrorTelefone(false)
    if (password && validatePassword(password)) setErrorPassword(false)
    if (cpf && validateCPF(cpf)) setErrorCpf(false)
    if (banco) setErrorBanco(false)
    if (agencia) setErrorAgencia(false)
    if (contaCorrente) setErrorContaCorrente(false)
    if (tipoChavePix) setErrorTipoChavePix(false)
    if (chavePix) setErrorChavePix(false)
    if (aceiteTermos) setErrorAceiteTermos(false)
  }, [name, email, telefone, password, cpf, banco, agencia, contaCorrente, tipoChavePix, chavePix, aceiteTermos])

  // Função para copiar código do afiliado
  const copyCodigoAfiliado = () => {
    if (dadosSucesso?.codigo_afiliado) {
      Clipboard.setString(dadosSucesso.codigo_afiliado)
      Toast.show({
        type: 'success',
        text1: 'Código copiado para a área de transferência!',
      })
    }
  }

  // Se mostrar sucesso, exibir view de sucesso
  if (showSuccess && dadosSucesso) {
    return (
      <MainLayoutAutenticado notScroll={false} loading={false} marginTop={32} marginHorizontal={16}>
        <View className='flex-1 justify-between'>
          <View className='items-center'>
            <View className='mb-4 mt-4'>
              <LottieView
                style={{ width: 200, height: 200 }}
                source={require('../../../animations/cupom-validado.json')}
                autoPlay
                loop={false}
              />
            </View>
            <View className='my-4 mt-2 items-center'>
              <Caption fontSize={14} color={colors.gray} margintop={8} align={'center'}>
                Solicitação enviada com sucesso!
              </Caption>
              <H3 align={'center'}>
                Sua solicitação passará por validação. Após aprovado, você receberá aviso por e-mail e notificação no aplicativo.
              </H3>

            </View>

            <View className='w-full mt-6 px-4'>
              <View className='bg-[#F5F5F5] rounded-lg p-4 mb-4'>
                <Caption fontSize={12} color={colors.gray} margintop={0}>
                  ID do Afiliado
                </Caption>
                <H5>{dadosSucesso.afiliado_id}</H5>
              </View>

              <View className='bg-[#F5F5F5] rounded-lg p-4 mb-4'>
                <Caption fontSize={12} color={colors.gray} margintop={0}>
                  Código do Afiliado
                </Caption>
                <View className='flex-row items-center justify-between'>
                  <H5>{dadosSucesso.codigo_afiliado}</H5>
                  <TouchableOpacity
                    onPress={copyCodigoAfiliado}
                    className='bg-[#E5DEFF] px-3 py-2 rounded-lg'
                  >
                    <Caption fontSize={12} color={colors.primary40} fontWeight={'bold'}>
                      Copiar
                    </Caption>
                  </TouchableOpacity>
                </View>
              </View>

              <View className='bg-[#F5F5F5] rounded-lg p-4 mb-4'>
                <Caption fontSize={12} color={colors.gray} margintop={0}>
                  Status
                </Caption>
                <View className='flex-row items-center mt-1'>
                  <View
                    className='w-3 h-3 rounded-full mr-2'
                    style={{ backgroundColor: getStatusColor(dadosSucesso.status) }}
                  />
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.dark }}>
                    {getStatusLabel(dadosSucesso.status)}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* <View className='mb-8 w-full px-4'>
            <FilledButton
              title="Voltar"
              onPress={() => {
                setShowSuccess(false)
                setDadosSucesso(null)
              }}
            />
          </View> */}
        </View>
      </MainLayoutAutenticado>
    )
  }

  return (
    <MainLayoutAutenticado notScroll={false} loading={loading} marginTop={24} marginHorizontal={16}>
      <View className='mb-6 mt-12'>
        <H3>Solicitação de Afiliado</H3>
        <Caption fontSize={14} color={colors.gray} margintop={8}>
          Preencha todos os campos para cadastrar um novo afiliado
        </Caption>
      </View>

      {cpfPreenchido.length <= 2 &&
        <InputOutlined
          mt={8}
          required
          label="CPF"
          value={cpf}
          error={errorCpf}
          refInput={input5Ref}
          keyboardType={'number-pad'}
          maxLength={14}
          onChange={(text: string) => handleCPFMask(text)}
          onSubmitEditing={() => focusNextInput(input6Ref)}
        />
      }

      <InputOutlined
        mt={8}
        required
        label="Banco"
        value={banco}
        error={errorBanco}
        refInput={input6Ref}
        keyboardType={'default'}
        onChange={(text: string) => setBanco(text)}
        onSubmitEditing={() => focusNextInput(input7Ref)}
      />

      <InputOutlined
        mt={8}
        required
        label="Agência"
        value={agencia}
        error={errorAgencia}
        refInput={input7Ref}
        keyboardType={'number-pad'}
        onChange={(text: string) => setAgencia(text)}
        onSubmitEditing={() => focusNextInput(input8Ref)}
      />

      <InputOutlined
        mt={8}
        required
        label="Conta Corrente"
        value={contaCorrente}
        error={errorContaCorrente}
        refInput={input8Ref}
        keyboardType={'number-pad'}
        onChange={(text: string) => setContaCorrente(text)}
        onSubmitEditing={() => focusNextInput(input9Ref)}
      />

      <View className='mt-8'>
        <H5>Tipo de Chave PIX*</H5>
        {errorTipoChavePix && (
          <Caption fontSize={12} color={colors.error40} margintop={4}>
            Selecione o tipo de chave PIX
          </Caption>
        )}
        <RadioButton
          options={tiposChavePixDisplay}
          selectedOption={tiposChavePixReverseMap[tipoChavePix] || tipoChavePix}
          onSelectOption={(option: string) => {
            setTipoChavePix(tiposChavePixMap[option] || option.toLowerCase())
            setErrorTipoChavePix(false)
            setChavePix('') // Limpa ao trocar o tipo para não misturar formato
          }}
        />
      </View>

      {tipoChavePix === 'cpf' ? (
        <InputOutlined
          mt={8}
          required
          label="Chave PIX"
          value={chavePix}
          error={errorChavePix}
          refInput={input9Ref}
          keyboardType={'number-pad'}
          maxLength={14}
          onChange={(text: string) => handleChavePixChange(text)}
          placeholder="Digite o CPF da chave PIX"
          onSubmitEditing={() => focusNextInput(input4Ref)}
        />
      ) : tipoChavePix === 'telefone' ? (
        <InputOutlined
          mt={8}
          required
          label="Chave PIX"
          value={chavePix}
          error={errorChavePix}
          refInput={input9Ref}
          keyboardType={'phone-pad'}
          maxLength={15}
          onChange={(text: string) => handleChavePixChange(text)}
          placeholder="Digite o telefone da chave PIX"
          onSubmitEditing={() => focusNextInput(input4Ref)}
        />
      ) : (
        <InputOutlined
          mt={8}
          required
          label="Chave PIX"
          value={chavePix}
          error={errorChavePix}
          refInput={input9Ref}
          keyboardType={tipoChavePix === 'email' ? 'email-address' : 'default'}
          onChange={(text: string) => setChavePix(text)}
          placeholder={tipoChavePix === 'email' ? 'Digite o e-mail da chave PIX' : tipoChavePix === 'aleatoria' ? 'Digite a chave PIX aleatória' : 'Digite sua chave PIX'}
        />
      )}

      <InputOutlined
        mt={8}
        required
        label="Senha (mínimo 8 caracteres)"
        value={password}
        error={errorPassword}
        refInput={input4Ref}
        secureTextEntry={true}
        keyboardType={'default'}
        onChange={(text: string) => setPassword(text)}
        onSubmitEditing={() => focusNextInput(input5Ref)}
      />

      <View className='flex-row items-center gap-2 mt-6 mb-4'>
        <TouchableOpacity
          onPress={() => {
            const newChecked = !aceiteTermos
            setAceiteTermos(newChecked)
            setErrorAceiteTermos(false)
          }}
        >
          <View
            style={{
              width: 24,
              height: 24,
              borderWidth: 2,
              borderColor: '#000',
              borderRadius: 4,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: aceiteTermos ? '#000' : 'transparent',
            }}
          >
            {aceiteTermos && (
              <Text style={{ color: '#FFF', fontWeight: 'bold' }}>✓</Text>
            )}
          </View>
        </TouchableOpacity>
        <View className='flex-1'>
          <Caption fontSize={14}>
            Aceito os{' '}
            <Text
              onPress={() => setModalTermosVisible(true)}
              style={{ color: colors.primary40, textDecorationLine: 'underline', fontWeight: '600' }}
            >
              termos e condições*
            </Text>
          </Caption>
          {errorAceiteTermos && (
            <Caption fontSize={12} color={colors.error40} margintop={4}>
              Você deve aceitar os termos para continuar
            </Caption>
          )}
        </View>
      </View>

      <ModalTemplate
        visible={modalTermosVisible}
        onClose={() => setModalTermosVisible(false)}
        width={'95%'}
        maxWidth={500}
      >
        <View className='p-4'>
          <H5>Termos e Condições</H5>
          <Caption fontSize={14} color={colors.gray} margintop={4}>
            Políticas de privacidade e termos do programa de afiliados Discontapp
          </Caption>
          <Caption fontSize={14} color={colors.dark} margintop={12}>
            Para conhecer os termos e condições, abra o link no navegador.
          </Caption>
          <TouchableOpacity
            onPress={() => {
              Linking.openURL(TERMOS_AFILIADO_URL)
              setModalTermosVisible(false)
            }}
            className='mt-6 rounded-lg py-3 flex-row items-center justify-center'
            style={{ backgroundColor: colors.primary40 }}
          >
            <Ionicons name="open-outline" size={20} color="#FFF" style={{ marginRight: 8 }} />
            <Text className='text-base font-semibold' style={{ color: '#FFF' }}>
              Abrir termos e condições
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setModalTermosVisible(false)}
            className='mt-4 py-2'
          >
            <Caption fontSize={14} color={colors.gray} margintop={0} align={'center'}>
              Fechar
            </Caption>
          </TouchableOpacity>
        </View>
      </ModalTemplate>

      <ModalTemplate
        visible={modalValidacaoVisible}
        onClose={() => setModalValidacaoVisible(false)}
        width={'95%'}
        maxWidth={500}
      >
        <View className='p-4'>
          <H5 color={colors.error40}>Validação incorreta</H5>
          <Caption fontSize={14} color={colors.dark} margintop={8}>
            {mensagemValidacao}
          </Caption>
          <TouchableOpacity
            onPress={() => setModalValidacaoVisible(false)}
            className='mt-6 rounded-lg py-3 flex-row items-center justify-center'
            style={{ backgroundColor: colors.primary40 }}
          >
            <Text className='text-base font-semibold' style={{ color: colors.white }}>
              Entendi
            </Text>
          </TouchableOpacity>
        </View>
      </ModalTemplate>

      <View className='mb-8'>
        <FilledButton
          title="Enviar Solicitação"
          onPress={handleSubmit}
          disabled={loading}
        />
      </View>
      <View className='h-40 w-full' />
    </MainLayoutAutenticado>
  )
}

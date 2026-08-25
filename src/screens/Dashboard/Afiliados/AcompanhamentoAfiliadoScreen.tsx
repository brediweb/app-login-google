import H3 from '@components/typography/H3'
import H5 from '@components/typography/H5'
import Caption from '@components/typography/Caption'
import { useNavigate } from '@hooks/useNavigate'
import { useIsFocused } from '@react-navigation/native'
import React, { useEffect, useState, useRef } from 'react'
import { Text, TouchableOpacity, View, Linking, Share } from 'react-native'
import MainLayoutAutenticado from '@components/layout/MainLayoutAutenticado'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { colors } from '../../../styles/colors'
import Clipboard from '@react-native-clipboard/clipboard'
import Toast from 'react-native-toast-message'
import FilledButton from '@components/buttons/FilledButton'
import axios from 'axios'
import { Ionicons } from '@expo/vector-icons'
import ModalTemplate from '@components/Modals/ModalTemplate'

const TERMOS_AFILIADO_URL = 'https://discontapp.com.br/termo-de-uso-de-afiliados.pdf'

export default function AcompanhamentoAfiliadoScreen() {
  const isFocused = useIsFocused()
  const { navigate } = useNavigate()
  const [dadosAfiliado, setDadosAfiliado] = useState<any>(null)
  const [modalTermosVisible, setModalTermosVisible] = useState(false)

  async function getVerificaStatus() {
    const jsonValue = await AsyncStorage.getItem('infos-user')
    if (jsonValue) {
      const newJson = JSON.parse(jsonValue)
      const headers = {
        Authorization: `Bearer ${newJson.token}`,
      }

      const formData = {
        email: newJson.email,
      }

      try {
        const response = await axios.post('https://backend.discontapp.com.br/api/afiliados/verificar-status', formData, { headers })

        // Se o status for aprovado, salva os dados no estado
        if (response.data.data && response.data.data.status_aprovacao === 'aprovado') {
          setDadosAfiliado({
            codigo_afiliado: response.data.data.codigo_afiliado,
            data_aprovacao: response.data.data.data_aprovacao,
            data_cadastro: response.data.data.data_cadastro,
            status: response.data.data.status_aprovacao,
          })
        }
        if (response.data.data && response.data.data.status_aprovacao === 'pendente') {
          setDadosAfiliado({
            codigo_afiliado: response.data.data.codigo_afiliado,
            data_aprovacao: null,
            data_cadastro: response.data.data.data_cadastro,
            status: response.data.data.status_aprovacao,
          })
        }
        if (response.data.data && response.data.data.status_aprovacao === 'reprovado') {
          setDadosAfiliado({
            codigo_afiliado: null,
            data_aprovacao: null,
            data_cadastro: response.data.data.data_cadastro,
            status: response.data.data.status_aprovacao,
            motivo_reprovacao: response.data.data.motivo_reprovacao,
          })
        }
        // Novos status: nao_solicitou, em_validacao, suspenso (backend pode enviar qualquer um)
        const statusAtual = response.data.data?.status_aprovacao
        if (response.data.data && statusAtual && !['aprovado', 'pendente', 'reprovado'].includes(statusAtual)) {
          setDadosAfiliado({
            codigo_afiliado: response.data.data.codigo_afiliado ?? null,
            data_aprovacao: response.data.data.data_aprovacao ?? null,
            data_cadastro: response.data.data.data_cadastro,
            status: statusAtual,
            motivo_reprovacao: response.data.data.motivo_reprovacao ?? null,
            motivo_suspensao: response.data.data.motivo_suspensao ?? null,
          })
        }

      } catch (error: any) {
        console.error('Error verificar status: ', error)
      }
    }
  }

  // Função para copiar código do afiliado
  const copyCodigoAfiliado = () => {
    if (dadosAfiliado?.codigo_afiliado) {
      Clipboard.setString(dadosAfiliado.codigo_afiliado)
      Toast.show({
        type: 'success',
        text1: 'Código copiado para a área de transferência!',
      })
    }
  }

  // Função para compartilhar código do afiliado
  const compartilharCodigoAfiliado = async () => {
    if (!dadosAfiliado?.codigo_afiliado) return
    const message = `Meu código de afiliado Discontapp: ${dadosAfiliado.codigo_afiliado}\nUse no app para ganhar benefícios!`
    try {
      await Share.share({
        message,
        title: 'Código de afiliado Discontapp',
      })
    } catch {
      Toast.show({ type: 'error', text1: 'Não foi possível compartilhar.' })
    }
  }

  // Labels de status: nao_solicitou, em_validacao, aprovado, reprovado, suspenso
  const STATUS_LABELS: Record<string, string> = {
    nao_solicitou: 'Não Solicitou',
    em_validacao: 'Em Validação',
    pendente: 'Em Validação',
    aprovado: 'Aprovado',
    reprovado: 'Reprovado',
    suspenso: 'Suspenso',
  }

  const getStatusLabel = (status: string | undefined) => {
    if (!status) return ''
    const key = status.toLowerCase().replace(/\s/g, '_')
    return STATUS_LABELS[key] ?? status
  }

  // Função para obter cor do status
  const getStatusColor = (status: string) => {
    const key = status?.toLowerCase().replace(/\s/g, '_') ?? ''
    switch (key) {
      case 'aprovado':
        return '#4CAF50'
      case 'reprovado':
        return colors.error40
      case 'suspenso':
        return colors.gray
      case 'nao_solicitou':
      case 'em_validacao':
      case 'pendente':
      default:
        return colors.warning
    }
  }

  // Função para obter ícone do status
  const getStatusIcon = (status: string) => {
    const key = status?.toLowerCase().replace(/\s/g, '_') ?? ''
    switch (key) {
      case 'aprovado':
        return 'checkmark-circle'
      case 'reprovado':
        return 'close-circle'
      case 'suspenso':
        return 'pause-circle'
      case 'nao_solicitou':
        return 'document-text-outline'
      case 'em_validacao':
      case 'pendente':
      default:
        return 'time'
    }
  }

  useEffect(() => {
    if (isFocused) {
      getVerificaStatus()
    }
  }, [isFocused])

  return (
    <MainLayoutAutenticado notScroll={false} loading={false} marginTop={24} marginHorizontal={16}>
      <View className='flex-1 mt-24'>
        {dadosAfiliado ? (
          <>
            <View className='mb-6 items-center'>
              <Ionicons
                name={getStatusIcon(dadosAfiliado.status) as any}
                size={80}
                color={getStatusColor(dadosAfiliado.status)}
                style={{ marginBottom: 16 }}
              />
              <H3 align={'center'}>Status do Afiliado</H3>
              <Caption fontSize={14} color={colors.gray} margintop={8} align={'center'}>
                Consulte o status e informações do seu cadastro
              </Caption>
              <View className='w-full mt-4 px-4'>
                <FilledButton
                  title='Painel do Afiliado'
                  onPress={() => Linking.openURL('https://www.discontapp.com.br/usuario/login')}
                />
              </View>
            </View>

            <View className='w-full mt-6'>
              {dadosAfiliado.status?.toLowerCase().replace(/\s/g, '_') === 'suspenso' && (
                <View className='bg-[#F5F5F5] rounded-lg p-4 mb-4'>
                  <Caption fontSize={12} color={colors.gray} margintop={0}>
                    Mensagem de suspensão
                  </Caption>
                  <View style={{ marginTop: 4 }}>
                    <H5 color={colors.error40}>
                      {dadosAfiliado.motivo_suspensao || 'Seu cadastro como afiliado está suspenso. Entre em contato com o suporte para mais informações.'}
                    </H5>
                  </View>
                </View>
              )}

              {dadosAfiliado.codigo_afiliado && dadosAfiliado.status?.toLowerCase().replace(/\s/g, '_') !== 'suspenso' && (
                <View className='bg-[#F5F5F5] rounded-lg p-4 mb-4'>
                  <Caption fontSize={12} color={colors.gray} margintop={0}>
                    Código do Afiliado
                  </Caption>
                  <View style={{ marginBottom: 12 }}>
                    <H5>{dadosAfiliado.codigo_afiliado}</H5>
                  </View>
                  {dadosAfiliado.status?.toLowerCase().replace(/\s/g, '_') === 'aprovado' && (
                    <View className='flex-row'>
                      <TouchableOpacity
                        onPress={compartilharCodigoAfiliado}
                        className='flex-1 flex-row items-center justify-center px-4 py-3 rounded-lg mr-3'
                        style={{ backgroundColor: colors.primary30 }}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="share-social-outline" size={20} color={colors.white} />
                        <View style={{ marginLeft: 8 }}>
                          <Caption fontSize={14} color={colors.white} fontWeight={'bold'}>
                            Compartilhar código
                          </Caption>
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={copyCodigoAfiliado}
                        className='flex-row items-center px-4 py-3 rounded-lg'
                        style={{ backgroundColor: colors.primary90 }}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="copy-outline" size={18} color={colors.primary40} />
                        <View style={{ marginLeft: 8 }}>
                          <Caption fontSize={14} color={colors.primary40} fontWeight={'bold'}>
                            Copiar
                          </Caption>
                        </View>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}

              <View className='bg-[#F5F5F5] rounded-lg p-4 mb-4'>
                <Caption fontSize={12} color={colors.gray} margintop={0}>
                  Status
                </Caption>
                <View className='flex-row items-center mt-1'>
                  <View
                    className='w-3 h-3 rounded-full mr-2'
                    style={{ backgroundColor: getStatusColor(dadosAfiliado.status) }}
                  />
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.dark }}>
                    {getStatusLabel(dadosAfiliado.status)}
                  </Text>
                </View>
              </View>

              <View className='bg-[#F5F5F5] rounded-lg p-4 mb-4'>
                <Caption fontSize={12} color={colors.gray} margintop={0}>
                  Data de Cadastro
                </Caption>
                <H5>{dadosAfiliado.data_cadastro}</H5>
              </View>

              {dadosAfiliado.data_aprovacao &&
                <View className='bg-[#F5F5F5] rounded-lg p-4 mb-4'>
                  <Caption fontSize={12} color={colors.gray} margintop={0}>
                    Data de Aprovação
                  </Caption>
                  <H5>{dadosAfiliado.data_aprovacao}</H5>
                </View>
              }

              {dadosAfiliado.status === 'reprovado' && dadosAfiliado.motivo_reprovacao &&
                <View className='bg-[#F5F5F5] rounded-lg p-4 mb-4'>
                  <Caption fontSize={12} color={colors.gray} margintop={0}>
                    Motivo de Reprovação
                  </Caption>
                  <H5>{dadosAfiliado.motivo_reprovacao}</H5>
                </View>
              }

            </View>
          </>
        ) : (
          <>
            <View className='mb-6'>
              <H3 align={'center'}>Programa de Afiliados</H3>
              <Caption fontSize={14} color={colors.gray} margintop={8} align={'center'}>
                Ganhe comissões indicando novos clientes
              </Caption>
            </View>

            <View className='w-full mt-6'>
              <View className='bg-[#F5F5F5] rounded-lg p-4 mb-4'>
                <View className='mb-2'>
                  <H5>Como funciona?</H5>
                </View>
                <Caption fontSize={14} color={colors.dark} margintop={0}>
                  Cadastre-se como afiliado e receba um código único. Compartilhe esse código com seus amigos e ganhe comissões a cada novo cadastro realizado através do seu link.
                </Caption>
              </View>

              <View className='bg-[#F5F5F5] rounded-lg p-4 mb-4'>
                <View className='mb-2'>
                  <H5>Benefícios</H5>
                </View>
                <View className='mt-2'>
                  <Caption fontSize={14} color={colors.dark} margintop={4}>
                    • Ganhe comissões por cada indicação
                  </Caption>
                  <Caption fontSize={14} color={colors.dark} margintop={4}>
                    • Receba pagamentos via PIX
                  </Caption>
                  <Caption fontSize={14} color={colors.dark} margintop={4}>
                    • Acompanhe suas indicações em tempo real
                  </Caption>
                  <Caption fontSize={14} color={colors.dark} margintop={4}>
                    • Sem custos para participar
                  </Caption>
                </View>
              </View>

              <View className='bg-[#F5F5F5] rounded-lg p-4 mb-4'>
                <View className='mb-2'>
                  <H5>Requisitos</H5>
                </View>
                <Caption fontSize={14} color={colors.dark} margintop={0}>
                  Para se cadastrar como afiliado, você precisa ter uma conta ativa e preencher seus dados bancários para receber as comissões.
                </Caption>
              </View>

              <View className='mt-8 mb-8'>
                <FilledButton
                  backgroundColor={colors.gray}
                  title="Ver termos e políticas"
                  onPress={() => setModalTermosVisible(true)}
                />
                <View className='mt-3'>
                  <FilledButton
                    title="Enviar Solicitação"
                    onPress={() => navigate('CadastroAfiliadoScreen')}
                  />
                </View>
              </View>
            </View>
          </>
        )}

      </View>

      <ModalTemplate
        visible={modalTermosVisible}
        onClose={() => setModalTermosVisible(false)}
        width={'95%'}
        maxWidth={500}
      >
        <View className='p-4'>
          <H5>Políticas de Privacidade</H5>
          <Caption fontSize={14} color={colors.gray} margintop={4}>
            Termos sobre solicitar como afiliado Discontapp
          </Caption>
          <Caption fontSize={14} color={colors.dark} margintop={12}>
            Para conhecer os termos e políticas de privacidade do programa de afiliados, abra o link no navegador.
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
    </MainLayoutAutenticado>
  )
}

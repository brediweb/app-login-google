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

/** Plano Iniciate: teste gratuito com regras próprias (bloqueio por utilização). */
const PLANO_INICIATE_ID = 4

export function isPacoteGratuito(valor: string) {
  const parsed = parseFloat(String(valor).replace(',', '.'))
  return !Number.isNaN(parsed) && parsed <= 0
}

function isPlanoIniciate(planoId: number | string | undefined) {
  return Number(planoId) === PLANO_INICIATE_ID
}

/** Planos com valor zero (Sebrae, futuros programas) — ativação direta sem pagamento. */
function isPlanoProgramaGratuito(planoId: number | string | undefined, valor: string) {
  return isPacoteGratuito(valor) && !isPlanoIniciate(planoId)
}

function isPlanoAtivacaoDireta(planoId: number | string | undefined, valor: string) {
  return isPlanoIniciate(planoId) || isPlanoProgramaGratuito(planoId, valor)
}

/** Bloqueio/modal de uso: exclusivo do teste Iniciate (id 4), não dos programas R$ 0. */
function planoIniciateJaUtilizado(planoId: number | string | undefined, planoFreeUsado: boolean) {
  return isPlanoIniciate(planoId) && planoFreeUsado
}

/** Programas com valor zero (ex.: Sebrae) já concedidos — campo próprio da API. */
function planoProgramaJaUtilizado(planoId: number | string | undefined, valor: string, pacote: any) {
  if (!isPlanoProgramaGratuito(planoId, valor)) return false
  return !!(
    pacote?.plano_ja_concedido ??
    pacote?.utilizou_plano ??
    pacote?.ja_possui_plano
  )
}

function tituloPreco(planoId: number | string | undefined, valor: string) {
  if (isPlanoIniciate(planoId) && isPacoteGratuito(valor)) return 'Teste grátis'
  if (isPacoteGratuito(valor)) return 'Grátis'
  return `R$ ${valor}`
}

function mensagemLimitePlanoGratuito(
  pacote: any,
  tituloPlano: string,
  planoId: number | string | undefined,
) {
  const textoApi =
    pacote?.mensagem_limite ??
    pacote?.mensagem_plano_utilizado ??
    pacote?.mensagem_utilizacao
  if (typeof textoApi === 'string' && textoApi.trim().length > 0) {
    return textoApi.trim()
  }

  const limite =
    pacote?.limite_plano_gratuito ??
    pacote?.limite ??
    pacote?.quantidade_limite
  const utilizacoes =
    pacote?.quantidade_utilizada ??
    pacote?.vezes_utilizado ??
    pacote?.utilizacoes

  const nomePlano = tituloPlano || 'este plano'
  const ehIniciate = isPlanoIniciate(planoId)

  if (limite != null && String(limite).trim() !== '') {
    const usoInfo =
      utilizacoes != null && String(utilizacoes).trim() !== ''
        ? ` Você já realizou ${utilizacoes} de ${limite} utilização(ões) permitida(s).`
        : ` O limite permitido é de ${limite} utilização(ões) por conta.`
    return ehIniciate
      ? `O teste gratuito "${nomePlano}" já foi utilizado.${usoInfo}`
      : `O plano gratuito "${nomePlano}" já foi utilizado.${usoInfo}`
  }

  return ehIniciate
    ? `O teste gratuito "${nomePlano}" já foi utilizado. Cada conta pode ativar esse benefício apenas uma vez.`
    : `O plano gratuito "${nomePlano}" já foi utilizado. Cada conta pode ativar esse benefício apenas uma vez.`
}

export default function CardPacote({ titulo, beneficios, observacao, valor, props, plano_free_usado }: PropsPacote) {
  const { navigate } = useNavigate()
  const { setStatusTesteGratis } = useGlobal()
  const [loading, setLoading] = useState(false)
  const [modalDetalhesVisible, setModalDetalhesVisible] = useState(false)
  const [modalLimiteVisible, setModalLimiteVisible] = useState(false)
  const planoId = props?.id
  const iniciateJaUtilizado = planoIniciateJaUtilizado(planoId, plano_free_usado)
  const programaJaUtilizado = planoProgramaJaUtilizado(planoId, valor, props)
  const planoIndisponivel = iniciateJaUtilizado || programaJaUtilizado

  const handleOpenModalDetalhes = () => {
    setModalDetalhesVisible(true)
  }

  const handleCloseModalDetalhes = () => {
    setModalDetalhesVisible(false)
  }

  const handleCloseModalLimite = () => {
    setModalLimiteVisible(false)
  }

  function handleSelecionar() {
    if (planoIndisponivel) {
      setModalLimiteVisible(true)
      return
    }
    if (isPlanoAtivacaoDireta(planoId, valor)) {
      void onSubmitAtivacaoGratuita()
      return
    }
    navigate('ClienteTipoPacoteScreen', { props })
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

  async function onSubmitAtivacaoIniciate(
    headers: { Authorization: string },
    perfil: { cpf_represetante: string; email: string; telefone: string },
  ) {
    const novoTelefone = RemoveCaracteres({ text: perfil.telefone })
    await api.post(
      `/periodo-gratuito/post`,
      {
        cpf: perfil.cpf_represetante,
        email: perfil.email,
        telefone: novoTelefone,
        plano_id: planoId,
      },
      { headers },
    )
    setStatusTesteGratis(false)
    navigate('ClienteTesteGratisSucessoScreen')
  }

  async function onSubmitConcederPlanoGratuito(headers: { Authorization: string }) {
    const response = await api.post(
      `/conceder-plano`,
      { plano_id: planoId },
      { headers },
    )
    Toast.show({
      type: 'success',
      text1: response.data.message ?? 'Plano ativado com sucesso!',
    })
    navigate('ClienteTabNavigation', { screen: 'HomeClienteScreen' })
  }

  async function onSubmitAtivacaoGratuita() {
    setLoading(true)
    try {
      const jsonUsuario = await AsyncStorage.getItem('infos-user')
      if (!jsonUsuario) {
        Toast.show({
          type: 'error',
          text1: 'Sessão expirada. Faça login novamente.',
        })
        return
      }

      const newJsonUsuario = JSON.parse(jsonUsuario)
      const headers = {
        Authorization: `Bearer ${newJsonUsuario.token}`,
      }

      if (isPlanoIniciate(planoId)) {
        const jsonPerfil = await AsyncStorage.getItem('dados-perfil')
        if (!jsonPerfil) {
          Toast.show({
            type: 'error',
            text1: 'Complete seu perfil antes de ativar o plano.',
          })
          return
        }
        const perfil = JSON.parse(jsonPerfil)
        await onSubmitAtivacaoIniciate(headers, perfil)
      } else if (isPlanoProgramaGratuito(planoId, valor)) {
        await onSubmitConcederPlanoGratuito(headers)
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: error?.response?.data?.message ?? 'Ocorreu um erro, tente novamente mais tarde.',
      })
      console.error('ERROR ativação plano:', error?.response?.data)
    } finally {
      setLoading(false)
    }
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
        <H1 fontWeight={'700'} fontsize={24} title={tituloPreco(planoId, valor)} color='#000' />

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
            <FilledButton
              title={
                iniciateJaUtilizado
                  ? 'Teste já utilizado'
                  : programaJaUtilizado
                    ? 'Plano já utilizado'
                    : 'Selecionar'
              }
              onPress={handleSelecionar}
              backgroundColor={planoIndisponivel ? '#F4EFF4' : undefined}
              color={planoIndisponivel ? '#868687' : undefined}
            />
          </View>
          <View className='mt-4'>
            <ButtonOutline
              border={true}
              color={colors.secondary70}
              onPress={handleOpenModalDetalhes}
              backgroundColor={'transparent'}
              title='Detalhes'
            />
            <ModalTemplate visible={modalDetalhesVisible} onClose={handleCloseModalDetalhes}>
              <View className=' max-h-80 '>
                <H3>Detalhes do Pacote</H3>
                <ScrollView>
                  <Text className='text-sm mt-2'>
                    {observacao}
                  </Text>
                </ScrollView>
              </View>
            </ModalTemplate>
            <ModalTemplate visible={modalLimiteVisible} onClose={handleCloseModalLimite} width={'90%'}>
              <View className='py-2'>
                <H3 align='center'>
                  {isPlanoIniciate(planoId) ? 'Teste gratuito indisponível' : 'Plano gratuito indisponível'}
                </H3>
                <Caption align='center' fontSize={15} margintop={12}>
                  {mensagemLimitePlanoGratuito(props, titulo, planoId)}
                </Caption>
                <View className='mt-6'>
                  <FilledButton title='Entendi' onPress={handleCloseModalLimite} />
                </View>
              </View>
            </ModalTemplate>
          </View>
        </View>
      </View>
    </>
  )
}

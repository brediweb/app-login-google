import * as React from 'react'
import { useEffect } from 'react'
import HomeTabNavigation from '../HomeTabNavigation'
import { useNavigate } from '../../hooks/useNavigate'
import HeaderTab from '../../components/header/HeaderTab'
import ClienteTabNavigation from '../ClienteTabNavigation'
import { CustomDrawerContent } from './CustomDrawerContent'
import { useGlobal } from '../../context/GlobalContextProvider'
import { createDrawerNavigator } from '@react-navigation/drawer'
import AsyncStorage from '@react-native-async-storage/async-storage'

import FaqScreen from '../../screens/Dashboard/DrawerNavigation/FaqScreen'
import CameraScreen from '../../screens/Dashboard/ClienteNavigation/CameraScreen'
import ContatosScreen from '../../screens/Dashboard/DrawerNavigation/ContatosScreen'
import AvaliacaoScreen from '../../screens/Dashboard/DrawerNavigation/AvaliacaoScreen'
import DocumentosScreen from '../../screens/Dashboard/DrawerNavigation/DocumentosScreen'
import FiltrosScreen from '../../screens/Dashboard/DrawerNavigation/Filtros/FiltrosScreen'
import FaqDetalhesScreen from '../../screens/Dashboard/DrawerNavigation/FaqDetalhesScreen'
import ListaAvaliacaoScreen from '../../screens/Dashboard/DrawerNavigation/ListaAvaliacaoScreen'
import ListaDepoimentosScreen from '../../screens/Dashboard/DrawerNavigation/ListaDepoimentosScreen'
import OfertaDetalhesGeraCupomScreen from '../../screens/Dashboard/OfertaDetalhesGeraCupomScreen'
import ClienteAtualizaLocal from '../../screens/Dashboard/ClienteNavigation/ClienteAtualizaLocal'
import FiltroCidadeScreen from '../../screens/Dashboard/DrawerNavigation/Filtros/FiltroCidadeScreen'
import ClienteCriaCuponScreen from '../../screens/Dashboard/ClienteNavigation/ClienteCriaCuponScreen'
import FiltroOfertasScreen from '../../screens/Dashboard/DrawerNavigation/Filtros/FiltroOfertasScreen'
import NotificacoesScreen from '../../screens/Dashboard/DrawerNavigation/Notificacoes/NotificacoesScreen'
import AlterarSenhaScreen from '../../screens/Dashboard/DrawerNavigation/Configuracoes/AlterarSenhaScreen'
import FiltroAvaliacoesScreen from '../../screens/Dashboard/DrawerNavigation/Filtros/FiltroAvaliacoesScreen'
import ConfiguracoesScreen from '../../screens/Dashboard/DrawerNavigation/Configuracoes/ConfiguracoesScreen'
import FiltroLocalizacaoScreen from '../../screens/Dashboard/DrawerNavigation/Filtros/FiltroLocalizacaoScreen'
import FiltroOfertasReaisScreen from '../../screens/Dashboard/DrawerNavigation/Filtros/FiltroOfertasReaisScreen'
import FiltroCuponVigenteScreen from '../../screens/Dashboard/DrawerNavigation/Filtros/FiltroCuponVigenteScreen'
import ClienteConsumoScreen from '../../screens/Dashboard/DrawerNavigation/Cliente/Checkout/ClienteConsumoScreen'
import ClientePacotesScreen from '../../screens/Dashboard/DrawerNavigation/Cliente/Checkout/ClientePacotesScreen'
import SugerirEstabelecimentosScreen from '../../screens/Dashboard/DrawerNavigation/SugerirEstabelecimentosScreen'
import ClienteTipoPacoteScreen from '../../screens/Dashboard/DrawerNavigation/Cliente/Checkout/ClienteTipoPacoteScreen'
import ClientePagamentoEndereco from '../../screens/Dashboard/DrawerNavigation/Cliente/Checkout/ClientePagamentoEndereco'
import NotificacoesDetalhesScreen from '../../screens/Dashboard/DrawerNavigation/Notificacoes/NotificacoesDetalhesScreen'
import ClientePagamentoPixScreen from '../../screens/Dashboard/DrawerNavigation/Cliente/Checkout/ClientePagamentoPixScreen'
import FiltroOfertasPorcentagemScreen from '../../screens/Dashboard/DrawerNavigation/Filtros/FiltroOfertasPorcentagemScreen'
import FiltroDetalheLocalizacaoScreen from '../../screens/Dashboard/DrawerNavigation/Filtros/FiltroDetalheLocalizacaoScreen'
import ClienteTipoPagamentoScreen from '../../screens/Dashboard/DrawerNavigation/Cliente/Checkout/ClienteTipoPagamentoScreen'
import ClientePagamentoPixEndereco from '../../screens/Dashboard/DrawerNavigation/Cliente/Checkout/ClientePagamentoPixEndereco'
import ClientePagamentoCartaoScreen from '../../screens/Dashboard/DrawerNavigation/Cliente/Checkout/ClientePagamentoCartaoScreen'
import ClienteSucessoPagamentoScreen from '../../screens/Dashboard/DrawerNavigation/Cliente/Checkout/ClienteSucessoPagamentoScreen'
import ClienteSucessoPagamentoPixScreen from '../../screens/Dashboard/DrawerNavigation/Cliente/Checkout/ClienteSucessoPagamentoPixScreen'
import ClienteTesteGratisSucessoScreen from '../../screens/Dashboard/DrawerNavigation/Cliente/Checkout/ClienteTesteGratisSucessoScreen'
import DiscontokenScreen from '../../screens/Dashboard/DisconTokenScreen'
import ClienteAssinaturaScreen from '@screens/Dashboard/DrawerNavigation/Cliente/Checkout/ClienteAssinaturaScreen'

const Drawer = createDrawerNavigator()

export default function HomeDrawerNavigation() {
  const { tipoUser } = useGlobal()
  const { navigate } = useNavigate()

  async function getAcesso() {
    const storagePrimeiroAcesso = await AsyncStorage.getItem('primeiro-acesso')

    if (storagePrimeiroAcesso === null || storagePrimeiroAcesso != 'true') {
      try {
        const storagePrimeiroAcesso = await AsyncStorage.setItem('primeiro-acesso', 'true')
        if (tipoUser === 'Anunciante') {
          navigate('ClientePacotesScreen')
        }
      } catch (error: any) {
        console.error(error)
      }
    }
  }

  useEffect(() => {
    getAcesso()
  }, [])

  return (
    <Drawer.Navigator
      useLegacyImplementation={false}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={({ route }) => ({
        header: (props) => <HeaderTab {...props} />
      })}
    >
      {tipoUser === 'Anunciante' ?
        <Drawer.Screen options={{ headerShown: false }} name="ClienteTabNavigation" component={ClienteTabNavigation} />
        :
        <Drawer.Screen options={{ headerShown: false }} name="HomeTabNavigation" component={HomeTabNavigation} />
      }
      <Drawer.Screen options={{ headerTitle: 'Filtros' }} name="FiltrosScreen" component={FiltrosScreen} />
      <Drawer.Screen options={{ headerTitle: 'Notificações' }} name="NotificacoesScreen" component={NotificacoesScreen} />
      <Drawer.Screen options={{ headerShown: false }} name="NotificacoesDetalhesScreen" component={NotificacoesDetalhesScreen} />
      <Drawer.Screen options={{ headerTitle: 'Localização' }} name="FiltroLocalizacaoScreen" component={FiltroLocalizacaoScreen} />
      <Drawer.Screen options={{ headerShown: false }} name="FiltroDetalheLocalizacaoScreen" component={FiltroDetalheLocalizacaoScreen} />
      <Drawer.Screen options={{ headerTitle: 'Melhores Avaliações' }} name="FiltroAvaliacoesScreen" component={FiltroAvaliacoesScreen} />
      <Drawer.Screen options={{ headerTitle: 'Melhores Ofertas' }} name="FiltroOfertasScreen" component={FiltroOfertasScreen} />
      <Drawer.Screen options={{ headerTitle: 'Localidade' }} name="FiltroCidadeScreen" component={FiltroCidadeScreen} />
      <Drawer.Screen options={{ headerTitle: 'Melhores Ofertas (R$)', headerShown: false }} name="FiltroOfertasReaisScreen" component={FiltroOfertasReaisScreen} />
      <Drawer.Screen options={{ headerTitle: 'Melhores Ofertas (%)', headerShown: false }} name="FiltroOfertasPorcentagemScreen" component={FiltroOfertasPorcentagemScreen} />
      <Drawer.Screen options={{ headerTitle: 'Detalhes Oferta', headerShown: false }} name="OfertaDetalhesGeraCupomScreen" component={OfertaDetalhesGeraCupomScreen} />
      <Drawer.Screen options={{ headerTitle: 'Cupons Vigentes' }} name="FiltroCuponVigenteScreen" component={FiltroCuponVigenteScreen} />
      <Drawer.Screen options={{ headerShown: false }} name="SugerirEstabelecimentosScreen" component={SugerirEstabelecimentosScreen} />
      <Drawer.Screen options={{ headerTitle: 'Discontoken' }} name="DisconTokenScreen" component={DiscontokenScreen} />
      <Drawer.Screen options={{ headerTitle: 'Avaliações' }} name="AvaliacaoScreen" component={AvaliacaoScreen} />
      <Drawer.Screen options={{ headerTitle: 'Avaliações' }} name="ListaAvaliacaoScreen" component={ListaAvaliacaoScreen} />
      <Drawer.Screen options={{ headerTitle: 'Depoimentos' }} name="ListaDepoimentosScreen" component={ListaDepoimentosScreen} />
      <Drawer.Screen options={{ headerTitle: 'Configurações' }} name="ConfiguracoesScreen" component={ConfiguracoesScreen} />
      <Drawer.Screen options={{ headerTitle: 'Configurações' }} name="AlterarSenhaScreen" component={AlterarSenhaScreen} />
      <Drawer.Screen options={{ headerTitle: 'Documentos' }} name="DocumentosScreen" component={DocumentosScreen} />
      <Drawer.Screen options={{ headerTitle: 'Contato' }} name="ContatosScreen" component={ContatosScreen} />
      <Drawer.Screen options={{ headerTitle: 'FAQ' }} name="FaqScreen" component={FaqScreen} />
      <Drawer.Screen options={{ headerShown: false }} name="FaqDetalhesScreen" component={FaqDetalhesScreen} />
      <Drawer.Screen options={{ headerShown: false }} name="CameraScreen" component={CameraScreen} />
      <Drawer.Screen options={{ headerShown: false }} name="ClienteAtualizaLocal" component={ClienteAtualizaLocal} />

      {/* =================================================================== ================================================== */}
      {/* ================================================== ROTAS DO CLIENTE ================================================== */}
      {/* ====================================================================================================================== */}
      <Drawer.Screen options={{ headerShown: false }} name="ClienteCriaCuponScreen" component={ClienteCriaCuponScreen} />
      <Drawer.Screen options={{ headerShown: false }} name="ClientePacotesScreen" component={ClientePacotesScreen} />
      <Drawer.Screen options={{ headerShown: false }} name="ClienteTipoPacoteScreen" component={ClienteTipoPacoteScreen} />
      <Drawer.Screen options={{ headerShown: false }} name="ClienteTipoPagamentoScreen" component={ClienteTipoPagamentoScreen} />
      <Drawer.Screen options={{ headerShown: false }} name="ClientePagamentoPixScreen" component={ClientePagamentoPixScreen} />
      <Drawer.Screen options={{ headerShown: false }} name="ClienteSucessoPagamentoPixScreen" component={ClienteSucessoPagamentoPixScreen} />
      <Drawer.Screen options={{ headerShown: false }} name="ClientePagamentoPixEndereco" component={ClientePagamentoPixEndereco} />
      <Drawer.Screen options={{ headerShown: false }} name="ClientePagamentoCartaoScreen" component={ClientePagamentoCartaoScreen} />
      <Drawer.Screen options={{ headerShown: false }} name="ClientePagamentoEndereco" component={ClientePagamentoEndereco} />
      <Drawer.Screen options={{ headerShown: false }} name="ClienteSucessoPagamentoScreen" component={ClienteSucessoPagamentoScreen} />
      <Drawer.Screen options={{ headerShown: false }} name="ClienteTesteGratisSucessoScreen" component={ClienteTesteGratisSucessoScreen} />
      <Drawer.Screen options={{ headerShown: false }} name="ClienteConsumoScreen" component={ClienteConsumoScreen} />
      <Drawer.Screen options={{ headerShown: false }} name="ClienteAssinaturaScreen" component={ClienteAssinaturaScreen} />
    </Drawer.Navigator>
  )
}

import React from 'react'
import { Image } from 'react-native'
import { colors } from '../../styles/colors'
import CustomHeader from '../../components/header'
import HomeScreen from '../../screens/Dashboard/HomeScreen'
import PerfilScreen from '../../screens/Dashboard/PerfilScreen'
import FavoritosScreen from '../../screens/Dashboard/FavoritosScreen'
import UtilizadosScreen from '../../screens/Dashboard/UtilizadosScreen'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import HomeFiltradaScreen from '../../screens/Dashboard/HomeFiltradaScreen'
import OfertaDetalhesScreen from '../../screens/Dashboard/OfertaDetalhesScreen'
import ClienteOfertaDetalheHistoricoScreen from '../../screens/Dashboard/ClienteNavigation/ClienteOfertaDetalheHistoricoScreen'
import DiscotokenListagemScreen from '../../screens/Dashboard/DiscotokenListagemScreen'
import DiscotokenQrCodeScreen from '../../screens/Dashboard/DiscotokenQrCodeScreen'
import AcompanhamentoAfiliadoScreen from '@screens/Dashboard/Afiliados/AcompanhamentoAfiliadoScreen'
import CadastroAfiliadoScreen from '@screens/Dashboard/Afiliados/CadastroAfiliadoScreen'

const Tab = createBottomTabNavigator();

export default function HomeTabNavigation() {

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        header: (props) => <CustomHeader {...props} />,

        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused
              ? require('../../../assets/img/icons/house-focus.png')
              : require('../../../assets/img/icons/house.png')
          } else if (route.name === 'Meus Cupons') {
            iconName = focused
              ? require('../../../assets/img/icons/utilizados-focus.png')
              : require('../../../assets/img/icons/utilizados.png')
          } else if (route.name === 'Favoritos') {
            iconName = focused
              ? require('../../../assets/img/icons/favoritos-focus.png')
              : require('../../../assets/img/icons/favoritos.png')
          } else if (route.name === 'Perfil') {
            iconName = focused
              ? require('../../../assets/img/icons/perfil-focus.png')
              : require('../../../assets/img/icons/perfil.png')
          }
          return <Image
            style={{
              marginTop: 12,
            }}
            source={iconName} />;
        },
        tabBarActiveTintColor: '#FFF',
        tabBarInactiveTintColor: '#FFF',
        tabBarStyle: {
          height: 72,
          borderTopColor: 'transparent',
          backgroundColor: colors.secondary50,
        },
        tabBarLabelStyle: {
          fontSize: 14,
          marginTop: 12,
        },
      })}
    >

      <Tab.Screen name="Home" options={{ headerTitle: 'Home 1' }} component={HomeScreen} />
      <Tab.Screen name="Perfil" options={{ tabBarItemStyle: { display: 'none' } }} component={PerfilScreen} />
      <Tab.Screen name="Categorias" options={{ headerShown: true, tabBarItemStyle: { display: 'none' } }} component={HomeFiltradaScreen} />
      <Tab.Screen name="Discontoken" options={{ headerShown: true, tabBarItemStyle: { display: 'none' } }} component={DiscotokenListagemScreen} />
      <Tab.Screen name="DiscotokenQrCodeScreen" options={{ headerShown: true, headerTitle: 'QR Code Discontoken', tabBarItemStyle: { display: 'none' } }} component={DiscotokenQrCodeScreen} />
      <Tab.Screen name="Favoritos" options={{ headerTitle: 'Home 1' }} component={FavoritosScreen} />
      <Tab.Screen name="Meus Cupons" options={{ headerTitle: 'Home 1' }} component={UtilizadosScreen} />
      <Tab.Screen name="DetalhesHistorico" options={{ headerShown: false, tabBarItemStyle: { display: 'none' } }} component={ClienteOfertaDetalheHistoricoScreen} />
      <Tab.Screen name="Detalhes" options={{ headerShown: false, tabBarItemStyle: { display: 'none' } }} component={OfertaDetalhesScreen} />
      <Tab.Screen name="AcompanhamentoAfiliadoScreen" options={{ tabBarItemStyle: { display: 'none' } }} component={AcompanhamentoAfiliadoScreen} />
      <Tab.Screen name="CadastroAfiliadoScreen" options={{ tabBarItemStyle: { display: 'none' } }} component={CadastroAfiliadoScreen} />
    </Tab.Navigator>
  );
}

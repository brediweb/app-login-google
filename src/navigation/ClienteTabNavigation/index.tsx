import React from 'react'
import { Image } from 'react-native'
import { colors } from '../../styles/colors'
import CustomHeader from '../../components/header'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import CameraScreen from '../../screens/Dashboard/ClienteNavigation/CameraScreen'
import HomeClienteScreen from '../../screens/Dashboard/ClienteNavigation/HomeClienteScreen'
import ClientePerfilScreen from '../../screens/Dashboard/ClienteNavigation/ClientePerfilScreen'
import ClienteUtilizadosScreen from '../../screens/Dashboard/ClienteNavigation/ClienteUtilizadosScreen'
import ClienteCriaCuponScreen from '../../screens/Dashboard/ClienteNavigation/ClienteCriaCuponScreen'
import ClienteCupomSucessoScreen from '../../screens/Dashboard/ClienteNavigation/ClienteCupomSucessoScreen'
import ClienteListTodosDesativadosScreen from '../../screens/Dashboard/ClienteNavigation/ClienteListTodosDesativadosScreen'
import ClienteListTodosAtivosScreen from '../../screens/Dashboard/ClienteNavigation/ClienteListTodosAtivosScreen'
import ClienteOfertaDetalheScreen from '../../screens/Dashboard/ClienteNavigation/ClienteOfertaDetalheScreen'
import ClienteOfertaDetalheHistoricoScreen from '../../screens/Dashboard/ClienteNavigation/ClienteOfertaDetalheHistoricoScreen'
import ClientePerfilInformacoesScreen from '../../screens/Dashboard/ClienteNavigation/ClientePerfilInformacoesScreen'
import ClientePerfilCategoriaScreen from '../../screens/Dashboard/ClienteNavigation/ClientePerfilCategoriaScreen'
import ClientePerfilTrocarFotoScreen from '../../screens/Dashboard/ClienteNavigation/ClientePerfilTrocarFotoScreen'
import FormAtualizarHorarioScreen from '@screens/Dashboard/ClienteNavigation/FormAtualizarHorarioScreen'
import ClienteAtualizaLocal from '../../screens/Dashboard/ClienteNavigation/ClienteAtualizaLocal'

const Tab = createBottomTabNavigator();

export default function ClienteTabNavigation() {
  const homeTab = false

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        header: (props) => <CustomHeader {...props} />,

        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'HomeClienteScreen') {
            iconName = focused
              ? require('../../../assets/img/icons/house-focus.png')
              : require('../../../assets/img/icons/house.png')
          } else if (route.name === 'ClienteUtilizadosScreen') {
            iconName = focused
              ? require('../../../assets/img/icons/utilizados-focus.png')
              : require('../../../assets/img/icons/utilizados.png')
          } else if (route.name === 'ClienteCriaCuponScreen') {
            iconName = focused
              ? require('../../../assets/img/icons/plus-focus.png')
              : require('../../../assets/img/icons/plus.png')
          } else if (route.name === 'ClientePerfilScreen') {
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
      <Tab.Screen
        name="HomeClienteScreen"
        component={HomeClienteScreen}
        options={{
          tabBarLabel: 'Home'
        }}
      />
      <Tab.Screen
        name="ClientePerfilScreen"
        component={ClientePerfilScreen}
        options={{
          tabBarItemStyle: { display: 'none' },
          tabBarLabel: 'Perfil'
        }}
      />
      <Tab.Screen
        name="ClientePerfilInformacoesScreen"
        component={ClientePerfilInformacoesScreen}
        options={{
          tabBarItemStyle: { display: 'none' },
        }}
      />
      <Tab.Screen
        name="ClientePerfilCategoriaScreen"
        component={ClientePerfilCategoriaScreen}
        options={{
          tabBarItemStyle: { display: 'none' },
        }}
      />
      <Tab.Screen
        name="ClientePerfilTrocarFotoScreen"
        component={ClientePerfilTrocarFotoScreen}
        options={{
          tabBarItemStyle: { display: 'none' },
        }}
      />
      <Tab.Screen
        name="FormAtualizarHorarioScreen"
        component={FormAtualizarHorarioScreen}
        options={{
          tabBarItemStyle: { display: 'none' },
        }}
      />
      <Tab.Screen
        name="ClienteAtualizaLocal"
        component={ClienteAtualizaLocal}
        options={{
          headerShown: false,
          tabBarItemStyle: { display: 'none' },
        }}
      />
      <Tab.Screen
        name="ClienteCriaCuponScreen"
        component={ClienteCriaCuponScreen}
        options={{
          headerShown: false,
          tabBarLabel: 'Anúncio'
        }}
      />
      <Tab.Screen
        name="ClienteCupomSucessoScreen"
        component={ClienteCupomSucessoScreen}
        options={{
          headerShown: false,
          tabBarItemStyle: { display: 'none' },
        }}
      />
      <Tab.Screen
        name="ClienteListTodosDesativadosScreen"
        component={ClienteListTodosDesativadosScreen}
        options={{
          headerShown: false,
          tabBarItemStyle: { display: 'none' },
        }}
      />
      <Tab.Screen
        name="ClienteListTodosAtivosScreen"
        component={ClienteListTodosAtivosScreen}
        options={{
          headerShown: false,
          tabBarItemStyle: { display: 'none' },
        }}
      />
      <Tab.Screen
        name="ClienteUtilizadosScreen"
        component={ClienteUtilizadosScreen}
        options={{
          headerShown: false,
          tabBarLabel: 'Anúncios'
        }}
      />
      <Tab.Screen
        name="ClienteOfertaDetalheScreen"
        component={ClienteOfertaDetalheScreen}
        options={{
          headerShown: false,
          tabBarItemStyle: { display: 'none' },
        }}
      />
      <Tab.Screen
        name="Câmera"
        component={CameraScreen}
        options={{
          headerShown: false,
          tabBarItemStyle: {
            display: 'none'
          },
        }}
      />
    </Tab.Navigator>
  );
}

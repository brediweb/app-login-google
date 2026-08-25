import React, { useEffect } from 'react'
import { Button, Image, Modal } from 'react-native'
import { colors } from '../../styles/colors'
import CustomHeader from '../../components/header'
import FavoritosScreen from '../../screens/Dashboard/FavoritosScreen'
import UtilizadosScreen from '../../screens/Dashboard/UtilizadosScreen'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import HomeSemAuth from '../../screens/Dashboard/ScreensSemAuth/HomeSemAuth'
import ModalTemplateLogin from '../../components/Modals/ModalTemplateLogin'

const Tab = createBottomTabNavigator();

export default function SemAuthClienteTabNavigation() {

  const [modalLoginCliente, setModalLoginCliente] = React.useState(false);

  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          header: (props) => <CustomHeader {...props} />,
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Home') {
              iconName = focused
                ? require('../../../assets/img/icons/house-focus.png')
                : require('../../../assets/img/icons/house.png')
            } else if (route.name === 'Favoritos') {
              iconName = focused
                ? require('../../../assets/img/icons/favoritos-focus.png')
                : require('../../../assets/img/icons/favoritos.png')
            } else if (route.name === 'Meus Cupons') {
              iconName = focused
                ? require('../../../assets/img/icons/utilizados-focus.png')
                : require('../../../assets/img/icons/utilizados.png')
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
          tabBarOnPress: ({ navigation, route }: any) => {
          }
        })}
      >
        <Tab.Screen name="Home"
          options={{ headerTitle: 'Home' }}
          component={HomeSemAuth}
        />
        <Tab.Screen name="Favoritos"
          options={{ headerTitle: 'Favoritos' }}
          listeners={({ navigation, route }) => ({
            tabPress: (e) => {
              setModalLoginCliente(true);
              e.preventDefault();
            },
          })}
          component={FavoritosScreen}
        />
        <Tab.Screen name="Meus Cupons"
          options={{ headerTitle: 'Meus Cupons' }}
          component={UtilizadosScreen}
          listeners={({ navigation, route }) => ({
            tabPress: (e) => {
              setModalLoginCliente(true);
              e.preventDefault();
            },
          })}
        />
      </Tab.Navigator>
      <ModalTemplateLogin visible={modalLoginCliente} onClose={() => setModalLoginCliente(false)} />
    </>
  );
}

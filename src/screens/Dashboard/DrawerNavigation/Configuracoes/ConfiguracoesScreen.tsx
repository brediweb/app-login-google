import { useState } from 'react';
import { View } from 'react-native';
import { colors } from '../../../../styles/colors';
import { useNavigate } from '../../../../hooks/useNavigate';
import { CommonActions } from '@react-navigation/native';
import Caption from '../../../../components/typography/Caption';
import ButtonFiltro from '../../../../components/buttons/ButtonFiltro';
import FilledButton from '../../../../components/buttons/FilledButton';
import ModalTemplate from '../../../../components/Modals/ModalTemplate';
import MainLayoutAutenticado from '../../../../components/layout/MainLayoutAutenticado';
import { api } from '../../../../service/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGlobal } from '../../../../context/GlobalContextProvider';
import Toast from 'react-native-toast-message';
import React from 'react';

export default function ConfiguracoesScreen() {
  const { navigate, dispatch } = useNavigate();
  const [modalVisible, setModalVisible] = useState(false);
  const { tipoUser, setUsuarioLogado } = useGlobal();
  const [loading, setLoading] = useState(false);

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const deleteAccount = async () => {
    setLoading(true);
    const jsonValue = await AsyncStorage.getItem('infos-user');
    if (jsonValue) {
      const newJson = JSON.parse(jsonValue);
      try {
        const headers = {
          Authorization: `Bearer ${newJson.token}`,
        };
        const response = await api.post(
          '/perfil/desativar-conta',
          {},
          { headers }
        );
        Toast.show({ type: 'success', text1: 'Conta excluída com sucesso!' });
        AsyncStorage.setItem('infos-user', '');
        setUsuarioLogado(false);
        dispatch(
          CommonActions.reset({
            index: 1,
            routes: [{ name: 'LoginScreen' }],
          })
        );
      } catch (error: any) {
        console.error('ERRO POST Deletar Conta: ', error.request);
      }
    }
    setLoading(false);
  };

  return (
    <>
      <ModalTemplate visible={modalVisible} onClose={handleCloseModal}>
        <View className="p-2 mb-8">
          <Caption align={'center'} fontSize={14}>
            Tem certeza que deseja exluir seu cadastro ? não será possível
            recuperar nenhuma das informações relacionadas a sua conta !
          </Caption>
        </View>
        <View className="mb-2">
          <FilledButton
            backgroundColor={colors.error40}
            title="Confirmar exlusão de conta"
            onPress={deleteAccount}
          />
        </View>
        <FilledButton title="Voltar" onPress={handleCloseModal} />
      </ModalTemplate>
      <MainLayoutAutenticado marginTop={0} loading={loading}>
        <View className='w-full h-16' />
        <ButtonFiltro
          isActive={1}
          title="Alterar senha"
          onPress={() => navigate('AlterarSenhaScreen')}
        />
        <ButtonFiltro
          title="Excluir conta"
          isActive={1}
          color={colors.error40}
          icon_color={colors.error40}
          onPress={() => setModalVisible(true)}
        />
      </MainLayoutAutenticado>
    </>
  );
}

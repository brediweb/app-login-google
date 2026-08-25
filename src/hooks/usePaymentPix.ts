import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';
import { api } from '../service/api';
import { useNavigate } from './useNavigate';

export function usePaymentPix() {
  const [paymentPixStatus, setPaymentPixStatus] = useState(false);
  const { navigate } = useNavigate();

  async function getPaymentPixStatus(id: string) {
    try {
      const jsonValue = await AsyncStorage.getItem('infos-user');
      if (jsonValue) {
        const newJson = JSON.parse(jsonValue);

        try {
          const headers = {
            Authorization: `Bearer ${newJson.token}`,
          };
          const response = await api(`/pagamento-pix-status/${id}`, {
            headers,
          });
          setPaymentPixStatus(response.data.results.pagamento_aprovado);
          if (response.data.results.pagamento_aprovado) {
            navigate('ClienteSucessoPagamentoPixScreen');
          }
        } catch (error: any) {
          console.error(error.response.data);
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  return {
    getPaymentPixStatus,
    paymentPixStatus,
  };
}

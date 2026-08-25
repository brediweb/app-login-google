import FilledButton from '@components/buttons/FilledButton';
import HeaderPrimary from '@components/header/HeaderPrimary';
import MainLayoutAutenticadoSemScroll from '@components/layout/MainLayoutAutenticadoSemScroll';
import { useNavigate } from '@hooks/useNavigate';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { View, Text, Alert, Switch, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import Toast from 'react-native-toast-message';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useGlobal } from 'src/context/GlobalContextProvider';
import { api } from 'src/service/api';
import { colors } from 'src/styles/colors';

const diasDaSemana = [
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
  'Domingo',
];

export default function FormDefinirHorarioScreen({ route }: { route: any }) {
  const navigation = useNavigate()
  const irParaSucessoCadastroAnunciante = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'CadastroSucessoAnuncianteScreen' }],
    })
  }
  const isFocused = useIsFocused()
  const [loading, setLoading] = useState(false)
  const { setSenhaUser, senhaUser, setTelefoneDigitado, setTipoUser } = useGlobal()
  const [diasFechados, setDiasFechados] = useState<{ [key: string]: boolean }>({});
  const [emailStorage, setEmailStorage] = useState('')
  const [token, setToken] = useState('')
  const [horarios, setHorarios] = useState<{
    [key: string]: {
      abertura?: string;
      fechamentoAlmoco?: string;
      voltaAlmoco?: string;
      fechamento?: string;
    };
  }>({});

  // Controle do DateTimePicker
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [selectedField, setSelectedField] = useState<{ dia: string; campo: string } | null>(null);
  const [selectedTime, setSelectedTime] = useState<Date>(new Date());

  const showDatePicker = (dia: string, campo: string) => {
    // Se já existe um horário selecionado, usar ele, caso contrário usar a hora atual
    const existingTime = horarios[dia]?.[campo as keyof typeof horarios[string]];
    if (existingTime) {
      const [hours, minutes] = existingTime.split(':').map(Number);
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);
      setSelectedTime(date);
    } else {
      setSelectedTime(new Date());
    }
    setSelectedField({ dia, campo });
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
    setSelectedField(null);
  };

  const handleTimeChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      if (event.type === 'set' && date && selectedField) {
        const timeString = date.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
          timeZone: 'America/Sao_Paulo',
        });
        handleHorarioChange(selectedField.dia, selectedField.campo, timeString);
      }
      hideDatePicker();
    } else if (Platform.OS === 'ios') {
      // No iOS, atualiza o estado enquanto o usuário seleciona
      if (date) {
        setSelectedTime(date);
      }
    }
  };

  const handleConfirmIOS = () => {
    if (selectedField) {
      const timeString = selectedTime.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'America/Sao_Paulo',
      });
      handleHorarioChange(selectedField.dia, selectedField.campo, timeString);
    }
    hideDatePicker();
  };

  const handleSwitch = (dia: string, value: boolean) => {
    setDiasFechados((prev) => ({ ...prev, [dia]: value }));
  };

  const handleHorarioChange = (dia: string, campo: string, value: string) => {
    setHorarios((prev) => ({
      ...prev,
      [dia]: {
        ...prev[dia],
        [campo]: value,
      },
    }));
  };

  async function postSalvaHorarios() {
    setLoading(true)
    try {
      const payload = {
        horarios: [
          {
            segunda: {
              fechado: diasFechados['Segunda'] || false,
              horario_abertura: horarios['Segunda']?.abertura || "",
              horario_fechamento_almoco: horarios['Segunda']?.fechamentoAlmoco || "",
              horario_abertura_almoco: horarios['Segunda']?.voltaAlmoco || "",
              horario_fechamento: horarios['Segunda']?.fechamento || "",
            },
            terca: {
              fechado: diasFechados['Terça'] || false,
              horario_abertura: horarios['Terça']?.abertura || "",
              horario_fechamento_almoco: horarios['Terça']?.fechamentoAlmoco || "",
              horario_abertura_almoco: horarios['Terça']?.voltaAlmoco || "",
              horario_fechamento: horarios['Terça']?.fechamento || "",
            },
            quarta: {
              fechado: diasFechados['Quarta'] || false,
              horario_abertura: horarios['Quarta']?.abertura || "",
              horario_fechamento_almoco: horarios['Quarta']?.fechamentoAlmoco || "",
              horario_abertura_almoco: horarios['Quarta']?.voltaAlmoco || "",
              horario_fechamento: horarios['Quarta']?.fechamento || "",
            },
            quinta: {
              fechado: diasFechados['Quinta'] || false,
              horario_abertura: horarios['Quinta']?.abertura || "",
              horario_fechamento_almoco: horarios['Quinta']?.fechamentoAlmoco || "",
              horario_abertura_almoco: horarios['Quinta']?.voltaAlmoco || "",
              horario_fechamento: horarios['Quinta']?.fechamento || "",
            },
            sexta: {
              fechado: diasFechados['Sexta'] || false,
              horario_abertura: horarios['Sexta']?.abertura || "",
              horario_fechamento_almoco: horarios['Sexta']?.fechamentoAlmoco || "",
              horario_abertura_almoco: horarios['Sexta']?.voltaAlmoco || "",
              horario_fechamento: horarios['Sexta']?.fechamento || "",
            },
            sabado: {
              fechado: diasFechados['Sábado'] || false,
              horario_abertura: horarios['Sábado']?.abertura || "",
              horario_fechamento_almoco: horarios['Sábado']?.fechamentoAlmoco || "",
              horario_abertura_almoco: horarios['Sábado']?.voltaAlmoco || "",
              horario_fechamento: horarios['Sábado']?.fechamento || "",
            },
            domingo: {
              fechado: diasFechados['Domingo'] || false,
              horario_abertura: horarios['Domingo']?.abertura || "",
              horario_fechamento_almoco: horarios['Domingo']?.fechamentoAlmoco || "",
              horario_abertura_almoco: horarios['Domingo']?.voltaAlmoco || "",
              horario_fechamento: horarios['Domingo']?.fechamento || "",
            },
          },
        ],
      };

      const response = await api.post(`/salva/horarios-funcionamento`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        Toast.show({ type: 'success', text1: 'Horários salvos com sucesso!' });
        irParaSucessoCadastroAnunciante()
      } else {
        Toast.show({ type: 'error', text1: 'Erro ao salvar horários' });
      }
    } catch (error: any) {
      console.error('Erro ao salvar horários: ', error);
      Toast.show({ type: 'error', text1: 'Erro ao salvar horários' });
    }
    setLoading(false)
  }

  async function getEmail() {
    setLoading(true)
    try {
      const storageEmail = await AsyncStorage.getItem('user-email')
      if (storageEmail !== null && senhaUser !== null) {
        setEmailStorage(storageEmail)
        postLogin(storageEmail)
      }
    } catch (error: any) {
      console.error('Error Storage: ', error)
    }
    setLoading(false)
  }

  const submitStorageLogin = async (value: any) => {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem('infos-user', jsonValue)
    } catch (error: any) {
      console.error(error)
    }
  }

  async function postLogin(emailarmazenado: any) {
    const formData = { email: emailarmazenado, password: senhaUser, role: "Anunciante" }
    try {
      const response = await api.post(`/login`, formData)
      if (!response.data.error) {
        submitStorageLogin(response.data.results)
        setTipoUser('Anunciante')
        setToken(response.data.results.token)
      } else {
        Toast.show({ type: 'error', text1: 'Erro ao carregar dados do usuário, verifique sua conexão' });
      }
    } catch (error: any) {
      console.error('Error Login Horários: ', error)
    }
    setLoading(false)
  }

  useEffect(() => { getEmail() }, [])
  useEffect(() => { if (isFocused) getEmail() }, [isFocused])

  return (
    <MainLayoutAutenticadoSemScroll loadign={loading} marginTop={0} marginHorizontal={0}>
      <HeaderPrimary titulo='Informe todos horários de funcionamento' />
      <ScrollView contentContainerStyle={styles.container}>

        {diasDaSemana.map((dia) => (
          <View key={dia} style={styles.diaContainer}>
            <View style={{ flexDirection: "row", justifyContent: 'space-between' }}>
              <Text style={styles.diaTitulo}>{dia}</Text>
              <View style={styles.switchContainer}>
                <Text>Aberto</Text>
                <Switch
                  style={{ height: 32, marginHorizontal: 4 }}
                  trackColor={{ false: '#767577', true: colors.danger }}
                  thumbColor={diasFechados[dia] || false ? '#f4f3f4' : colors.secondary40}
                  value={diasFechados[dia] || false}
                  onValueChange={(value) => handleSwitch(dia, value)}
                />
                <Text>Fechado</Text>
              </View>
            </View>

            {!diasFechados[dia] && (
              <View style={styles.inputsContainer}>
                <TouchableOpacity style={styles.input} onPress={() => showDatePicker(dia, 'abertura')}>
                  <Text>{horarios[dia]?.abertura || 'Horário de Abertura'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.input} onPress={() => showDatePicker(dia, 'fechamentoAlmoco')}>
                  <Text>{horarios[dia]?.fechamentoAlmoco || 'Horário de Fechamento Almoço'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.input} onPress={() => showDatePicker(dia, 'voltaAlmoco')}>
                  <Text>{horarios[dia]?.voltaAlmoco || 'Horário da Volta Almoço'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.input} onPress={() => showDatePicker(dia, 'fechamento')}>
                  <Text>{horarios[dia]?.fechamento || 'Horário de Fechamento'}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}

        <View style={{ marginVertical: 16 }}>
          <FilledButton title='Salvar Horários' onPress={postSalvaHorarios} />
        </View>
        <View style={{ marginBottom: 16 }}>
          <FilledButton backgroundColor={colors.gray} title='Pular' onPress={irParaSucessoCadastroAnunciante} />
        </View>
      </ScrollView>

      {isDatePickerVisible && (
        <>
          <DateTimePicker
            value={selectedTime}
            mode="time"
            is24Hour={true}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleTimeChange}
            locale="pt-BR"
            style={Platform.OS === 'ios' ? styles.iosPicker : undefined}
          />
          {Platform.OS === 'ios' && (
            <View style={styles.iosPickerContainer}>
              <TouchableOpacity style={styles.iosPickerButton} onPress={hideDatePicker}>
                <Text style={styles.iosPickerButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iosPickerButton}
                onPress={handleConfirmIOS}
              >
                <Text style={[styles.iosPickerButtonText, styles.iosPickerButtonTextConfirm]}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </MainLayoutAutenticadoSemScroll >
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  diaContainer: {
    marginBottom: 24,
    backgroundColor: '#f7f7f7',
    borderRadius: 8,
    padding: 12,
  },
  diaTitulo: { fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  switchContainer: { flexDirection: 'row', alignItems: 'center' },
  inputsContainer: { marginTop: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  iosPicker: {
    width: '100%',
    height: 200,
  },
  iosPickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f7f7f7',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  iosPickerButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  iosPickerButtonText: {
    fontSize: 16,
    color: '#666',
  },
  iosPickerButtonTextConfirm: {
    color: colors.secondary40 || '#007AFF',
    fontWeight: '600',
  },
});

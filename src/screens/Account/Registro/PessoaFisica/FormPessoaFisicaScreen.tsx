import Toast from 'react-native-toast-message';
import { api, api_ibge } from '../../../../service/api';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from '../../../../hooks/useNavigate';
import ValidarCPF from '../../../../components/forms/ValidarCPF';
import ValidarEmail from '../../../../components/forms/ValidarEmail';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGlobal } from '../../../../context/GlobalContextProvider';
import InputOutlined from '../../../../components/forms/InputOutlined';
import FilledButton from '../../../../components/buttons/FilledButton';
import HeaderPrimary from '../../../../components/header/HeaderPrimary';
import RemoveCaracteres from '../../../../components/forms/RemoveCaracteres';
import InputMascaraPaper from '../../../../components/forms/InputMascaraPaper';
import MainLayoutSecondary from '../../../../components/layout/MainLayoutSecondary';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import axios from 'axios';
import ModalTemplate from '../../../../components/Modals/ModalTemplate';
import { colors } from '../../../../styles/colors';

export default function FormPessoaFisicaScreen({
  navigation,
}: {
  navigation: any;
}) {
  const input1Ref = useRef(null);
  const input2Ref = useRef(null);
  const input3Ref = useRef(null);
  const input4Ref = useRef(null);
  const input5Ref = useRef(null);
  const input6Ref = useRef(null);
  const input7Ref = useRef(null);
  const input8Ref = useRef(null);
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [endereco, setEndereco] = useState('');
  const [cep, setCep] = useState('');
  const [estado, setEstado] = useState('');
  const [bairro, setBairro] = useState('');
  const [rua, setRua] = useState('');
  const [uf, setUf] = useState('');
  const [cidade, setCidade] = useState('');
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [complemento, setComplemento] = useState('');
  const [celularField, setCelularField] = useState('');
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [erroChecked, setErroChecked] = useState(false);
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [listaEstados, setListaEstados] = useState<any>([]);
  const [listaCidades, setListaCidades] = useState<any>([]);
  // STATUS ERROR DOS CAMPOS
  const { navigate } = useNavigate();
  const [errorcpf, setErrorCpf] = useState(false);
  const [erroremail, setErrorEmail] = useState(false);
  const [errorsenha, setErrorSenha] = useState(false);
  const [errorCep, setErrorCep] = useState(false);
  const [errorCidade, setErrorCidade] = useState(false);
  const [errorEstado, setErrorEstado] = useState(false);
  const [errorEndereco, setErrorEndereco] = useState(false);
  const [errorcomplemento, setErrorComplemento] = useState(false);
  const [errorcelularField, setErrorCelularField] = useState(false);
  const [errornomeCompleto, setErrorNomeCompleto] = useState(false);
  const [errorconfirmarSenha, setErrorConfirmarSenha] = useState(false);

  const [modalCidade, setModalCidade] = useState(false);
  const [modalUf, setModalUf] = useState(false);

  const { telefoneDigitado, setSenhaUser, setTipoUser, setTelefoneDigitado } =
    useGlobal();

  async function postPessoaFisica() {
    const cpfValido = ValidarCPF({ cpf: cpf });
    const emailValido = ValidarEmail({ email: email });
    setErrorCep(false);
    setErrorCpf(false);
    setErrorEmail(false);
    setErrorSenha(false);
    setErrorCidade(false);
    setErrorEstado(false);
    setErrorEndereco(false);
    setErrorComplemento(false);
    setErrorCelularField(false);
    setErrorNomeCompleto(false);
    setErrorConfirmarSenha(false);

    if (nomeCompleto.length <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Informe um Nome completo válido !',
      });
      setErrorNomeCompleto(true);
      return;
    }
    if (email.length <= 0) {
      Toast.show({
        type: 'error',
        text1: 'O campo e-mail é obrigatório !',
      });
      setErrorEmail(true);
      return;
    }
    if (!emailValido) {
      Toast.show({
        type: 'error',
        text1: 'Informe um email válido !',
      });
      setErrorEmail(true);
      return;
    }
    if (celularField.replace(/\D/g, '').length < 10) {
      Toast.show({
        type: 'error',
        text1: 'Informe um Telefone válido !',
      });
      setErrorCelularField(true);
      return;
    }
    // if (endereco.length <= 0) {
    //   Toast.show({
    //     type: 'error',
    //     text1: 'Informe um Endereço válido !',
    //   });
    //   setErrorEndereco(true)
    //   return;
    // }
    // if (complemento.length <= 0) {
    //   Toast.show({
    //     type: 'error',
    //     text1: 'Informe um Complemento válido !',
    //   });
    //   setErrorComplemento(true)
    //   return;
    // }
    // if (cpf.length <= 0) {
    //   Toast.show({
    //     type: 'error',
    //     text1: 'Preencha o campo CPF !',
    //   });
    //   setErrorCpf(true);
    //   return;
    // }
    // if (endereco.length <= 0) {
    //   Toast.show({
    //     type: 'error',
    //     text1: 'Informe um Endereço válido !',
    //   });
    //   setErrorEndereco(true);
    //   return;
    // }
    // if (!cpfValido) {
    //   Toast.show({
    //     type: 'error',
    //     text1: 'Informe um CPF válido !',
    //   });
    //   setErrorCpf(true);
    //   return;
    // }
    // if (cep.length <= 0 || cep.length < 8) {
    //   Toast.show({
    //     type: 'error',
    //     text1: 'Informe um CEP válido !',
    //   });
    //   setErrorCep(true);
    //   return;
    // }
    if (senha.length <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Informe uma Senha válida !',
      });
      setErrorSenha(true);
      return;
    }
    if (senha.length < 8) {
      Toast.show({
        type: 'error',
        text1: 'Senha precisa possuir no mínimo 8 caracteres !',
      });
      setErrorSenha(true);
      return;
    }
    if (confirmarSenha.length <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Informe o confirmar senha válido !',
      });
      setErrorConfirmarSenha(true);
      return;
    }
    if (senha != confirmarSenha) {
      Toast.show({
        type: 'error',
        text1: 'Você informou senhas diferentes !',
      });
      setErrorConfirmarSenha(true);
      setErrorSenha(true);
      return;
    }
    if (checked === false) {
      Toast.show({
        type: 'error',
        text1: 'Aceite os Termos !',
      });
      return;
    }

    setLoading(true);

    const novoCpf = RemoveCaracteres({ text: cpf });
    const novoTelefone = RemoveCaracteres({ text: celularField });
    const novoCep = RemoveCaracteres({ text: cep });

    if (celularField && endereco && complemento) {
      const dataForm = {
        nome_completo: nomeCompleto,
        email: email,
        telefone: novoTelefone,
        // endereco: endereco,
        // rua: rua,
        // bairro: bairro,
        // cep: novoCep,
        // cidade: cidade,
        // estado: estado,
        // complemento: complemento,
        // cpf: novoCpf,
        senha: senha,
      };

      try {
        const response = await api.post(`/cadastro/pessoa-fisica`, dataForm);
        if (response.status === 200) {
          const storageEmail = await AsyncStorage.setItem('user-email', email);
          const jsonValue = JSON.stringify(response.data.results.id);
          const storagePerfil = await AsyncStorage.setItem(
            'dados-perfil',
            jsonValue
          );
          await AsyncStorage.setItem('id-user', jsonValue)

          setSenhaUser(senha);
          Toast.show({
            type: 'success',
            text1: 'Cadastro realizado !',
          });
          setTelefoneDigitado(celularField);
          setTipoUser('Cliente');
          navigation.navigate('ValidaCodigoScreen');
        } else {
          Toast.show({
            type: 'error',
            text1:
              response.data.message ??
              'Ocorreu um erro, tente novamente mais tarde !',
          });
        }
      } catch (error: any) {
        Toast.show({
          type: 'error',
          text1:
            error.response.data.message ?? 'Ocorreu um erro, tente novamente !',
        });
        console.error(error?.response?.data);
      }
    } else if (celularField && endereco) {
      const dataForm = {
        nome_completo: nomeCompleto,
        email: email,
        telefone: novoTelefone,
        endereco: endereco,
        cpf: novoCpf,
        senha: senha,
      };

      try {
        const response = await api.post(`/cadastro/pessoa-fisica`, dataForm);
        if (!response.data.error) {
          const storageEmail = await AsyncStorage.setItem('user-email', email);
          const jsonValue = JSON.stringify(response.data.results.id);
          const storagePerfil = await AsyncStorage.setItem(
            'dados-perfil',
            jsonValue
          );

          setSenhaUser(senha);
          Toast.show({
            type: 'success',
            text1: 'Cadastro realizado !',
          });
          setTelefoneDigitado(celularField);
          setTipoUser('Cliente');
          navigation.navigate('ValidaCodigoScreen');
        } else {
          Toast.show({
            type: 'error',
            text1:
              response.data.message ??
              'Ocorreu um erro, tente novamente mais tarde !',
          });
        }
      } catch (error: any) {
        Toast.show({
          type: 'error',
          text1:
            error.response.data.message ?? 'Ocorreu um erro, tente novamente !',
        });
        console.error(error.response.data);
      }
    } else if (celularField) {
      const dataForm = {
        nome_completo: nomeCompleto,
        email: email,
        telefone: novoTelefone,
        cpf: novoCpf,
        senha: senha,
      };
      try {
        const response = await api.post(`/cadastro/pessoa-fisica`, dataForm);
        if (!response.data.error) {
          const storageEmail = await AsyncStorage.setItem('user-email', email);
          const jsonValue = JSON.stringify(response.data.results.id);
          const storagePerfil = await AsyncStorage.setItem(
            'dados-perfil',
            jsonValue
          );
          await AsyncStorage.setItem(
            'id-user',
            response.data.results.id.toString()
          );
          setSenhaUser(senha);
          Toast.show({
            type: 'success',
            text1: 'Cadastro realizado !',
          });
          setTelefoneDigitado(celularField);
          setTipoUser('Cliente');
          navigation.navigate('ValidaCodigoScreen');
        } else {
          Toast.show({
            type: 'error',
            text1:
              response.data.message ??
              'Ocorreu um erro, tente novamente mais tarde !',
          });
        }
      } catch (error: any) {
        Toast.show({
          type: 'error',
          text1:
            error.response.data.message ?? 'Ocorreu um erro, tente novamente !',
        });
        console.error(error?.response?.data);
      }
    } else {
      const dataForm = {
        nome_completo: nomeCompleto,
        email: email,
        cpf: novoCpf,
        senha: senha,
      };
      try {
        const response = await api.post(`/cadastro/pessoa-fisica`, dataForm);
        if (!response.data.error) {
          const storageEmail = await AsyncStorage.setItem('user-email', email);
          const jsonValue = JSON.stringify(response.data.results.id);
          const storagePerfil = await AsyncStorage.setItem(
            'dados-perfil',
            jsonValue
          );

          setSenhaUser(senha);
          Toast.show({
            type: 'success',
            text1: 'Cadastro realizado !',
          });
          setTelefoneDigitado(celularField);
          setTipoUser('Cliente');
          navigation.navigate('ValidaCodigoScreen');
        } else {
          Toast.show({
            type: 'error',
            text1:
              response.data.message ??
              'Ocorreu um erro, tente novamente mais tarde !',
          });
        }
      } catch (error: any) {
        Toast.show({
          type: 'error',
          text1:
            error.response.data.message ?? 'Ocorreu um erro, tente novamente !',
        });
        console.error(error.response.data);
      }
    }
    setLoading(false);
  }

  async function getCidades() {
    try {
      const response = await api_ibge.get(
        `/localidades/estados/${uf}/municipios`
      );
      setListaCidades(response.data);
    } catch (error: any) {
      console.error('ERRO', error);
    }
  }

  function openModalCidades() {
    if (uf) {
      getCidades();
      setModalCidade(true);
    } else {
      Toast.show({
        type: 'error',
        text1: 'Selecione o seu Estado(UF) !',
      });
      setErrorEstado(true);
    }
  }

  async function getCEP(novoCep: any) {
    setLoading(true)
    try {
      const response = await axios.get(
        `https://brasilapi.com.br/api/cep/v2/${novoCep}`
      );
      setEndereco(response.data.street);
      setCidade(response.data.city);
      setEstado(response.data.state);
      setUf(response.data.state);
      setRua(response.data.street);
      setBairro(response.data.neighborhood);
    } catch (error: any) {
      console.error('Error GET CEP', error);
    }
    setLoading(false)
  }

  const handleCEPChange = (text: string) => {
    const cleanedText = text.replace(/\D/g, '');

    let formattedCEP = cleanedText;
    if (cleanedText.length > 5) {
      formattedCEP = `${cleanedText.slice(0, 5)}-${cleanedText.slice(5, 8)}`;
    }

    setCep(formattedCEP);
  };

  const handleCep = () => {
    const newCep = cep.replace(/\D/g, '');
    getCEP(newCep);
  };

  const handlePhoneMask = (value: any) => {
    let phone = value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .replace(/(\d{4})-(\d)(\d{4})/, '$1$2-$3');
    setCelularField(phone);
  };

  const handleCPFMask = (value: any) => {
    let cpf = value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{2})$/, '$1-$2');
    setCpf(cpf);
  };

  const handleCheckboxPress = () => {
    setChecked(!checked);
  };

  const focusNextInput = (nextInputRef: any) => {
    if (nextInputRef.current) {
      nextInputRef.current.focus();
    }
  };

  async function getEstados() {
    try {
      const response = await api_ibge.get(`/localidades/estados`);
      setListaEstados(response.data);
    } catch (error: any) {
      console.error('ERRO GET Estados', error);
    }
  }

  useEffect(() => {
    getEstados();
  }, [])

  useEffect(() => {
    if (checked) {
      setErroChecked(false);
    } else {
      setErroChecked(true);
    }
  }, [checked]);

  return (
    <MainLayoutSecondary loading={loading}>
      <ModalTemplate onClose={() => setModalUf(false)} visible={modalUf}>
        <View className="">
          <Text className="text-xl font-bold mt-4">
            Selecione o seu Estado(UF):
          </Text>
          <ScrollView className="w-full h-40">
            {listaEstados &&
              listaEstados
                .sort((a: any, b: any) => a.nome.localeCompare(b.nome))
                .map((item: any, index: any) => (
                  <TouchableOpacity
                    className=" rounded-md my-1 px-2 py-2"
                    style={{
                      backgroundColor: colors.primary90,
                    }}
                    key={index}
                    onPress={() => {
                      setEstado(item.nome);
                      setCidade('');
                      setErrorEstado(false);
                      setUf(item.sigla);
                      setModalUf(false);
                      getCidades();
                    }}
                  >
                    <Text className="text-md font-semibold">
                      {item.nome} - ({item.sigla})
                    </Text>
                  </TouchableOpacity>
                ))}
          </ScrollView>
        </View>
      </ModalTemplate>

      <ModalTemplate
        onClose={() => setModalCidade(false)}
        visible={modalCidade}
      >
        <View className="">
          <Text className="text-xl font-bold mt-4">
            Selecione o sua cidade:
          </Text>
          <ScrollView className="w-full h-40">
            {listaCidades &&
              listaCidades
                .sort((a: any, b: any) => a.nome.localeCompare(b.nome))
                .map((item: any, index: any) => (
                  <TouchableOpacity
                    className=" rounded-md my-1 px-2 py-2"
                    style={{
                      backgroundColor: colors.primary90,
                    }}
                    key={index}
                    onPress={() => {
                      setCidade(item.nome);
                      setModalCidade(false);
                    }}
                  >
                    <Text className="text-md font-semibold">{item.nome}</Text>
                  </TouchableOpacity>
                ))}
          </ScrollView>
        </View>
      </ModalTemplate>

      <HeaderPrimary
        titulo="Cadastro de pessoa física"
        voltarScreen={() => navigation.navigate('LoginScreen')}
      />

      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 220, marginHorizontal: 20 }}>
        <InputOutlined
          mt={8}
          required
          label="Nome completo"
          keyboardType={'default'}
          error={errornomeCompleto}
          onSubmitEditing={() => focusNextInput(input1Ref)}
          onChange={(text: string) => setNomeCompleto(text)}
        />
        <InputOutlined
          mt={8}
          required
          label="Email"
          error={erroremail}
          refInput={input1Ref}
          keyboardType={'email-address'}
          onChange={(text: string) => setEmail(text)}
          onSubmitEditing={() => focusNextInput(input2Ref)}
        />
        <InputOutlined
          mt={8}
          required
          label="Telefone (DDD)"
          value={celularField}
          error={errorcelularField}
          refInput={input2Ref}
          keyboardType={'phone-pad'}
          maxLength={15}
          onChange={(text: string) => handlePhoneMask(text)}
          onSubmitEditing={() => focusNextInput(input3Ref)}
        />
        {/* <InputMascaraPaper
          mt={8}
          label="CEP"
          value={cep}
          error={errorCep}
          onBlur={handleCep}
          refInput={input3Ref}
          keyboardType={'number-pad'}
          onChangeText={handleCEPChange}
          onSubmitEditing={() => focusNextInput(input4Ref)}
        />
        <View className="flex flex-row w-full">
          <TouchableOpacity
            className="flex-1/2"
            onPress={() => setModalUf(true)}
          >
            <View
              style={{ borderColor: errorEstado ? '#f01' : '#49454F' }}
              className="bg-white text-base overflow-scroll justify-center border-solid border-[1px] rounded-md h-[52px] w-16 mt-3 pl-2"
            >
              {uf ? (
                <Text className="text-[#000]">{uf}</Text>
              ) : (
                <Text style={{ color: errorEstado ? '#f01' : '#49454F' }}>
                  UF*
                </Text>
              )}
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 pl-2 z-10"
            onPress={openModalCidades}
          >
            <View className="bg-white text-base overflow-scroll justify-center border-solid border-[1px] border-[#49454F] rounded-md h-[52px] mt-3 pl-2">
              {cidade ? (
                <Text className="text-[#49454F]">{cidade}</Text>
              ) : (
                <Text className="text-[#49454F]">Cidade*</Text>
              )}
            </View>
          </TouchableOpacity>
        </View>
        <InputOutlined
          mt={8}
          required
          label="Endereço"
          value={endereco}
          error={errorEndereco}
          refInput={input4Ref}
          keyboardType={'default'}
          onChange={(text: string) => setEndereco(text)}
          onSubmitEditing={() => focusNextInput(input5Ref)}
        />
        <InputOutlined
          mt={8}
          label="Complemento"
          refInput={input5Ref}
          error={errorcomplemento}
          keyboardType={'default'}
          onChange={(text: string) => setComplemento(text)}
          onSubmitEditing={() => focusNextInput(input6Ref)}
        /> */}
        {/* <InputMascaraPaper
          mt={8}
          required
          label="CPF"
          value={cpf}
          maxLength={14}
          error={errorcpf}
          refInput={input7Ref}
          keyboardType={'number-pad'}
          onChangeText={(text: any) => handleCPFMask(text)}
          onSubmitEditing={() => focusNextInput(input7Ref)}
        /> */}
        <InputOutlined
          mt={8}
          required
          label="Senha (min 8 caracteres)"
          error={errorsenha}
          refInput={input7Ref}
          secureTextEntry={true}
          keyboardType={'default'}
          onChange={(text: string) => setSenha(text)}
          onSubmitEditing={() => focusNextInput(input8Ref)}
        />
        <InputOutlined
          mt={8}
          required
          refInput={input8Ref}
          secureTextEntry={true}
          label="Confirmar Senha"
          keyboardType={'default'}
          error={errorconfirmarSenha}
          onChange={(text: string) => setConfirmarSenha(text)}
        />
        <View className="flex-row items-center gap-2 mt-4">
          <TouchableOpacity onPress={handleCheckboxPress}>
            <View
              className="w-6 h-6 border-2  rounded-lg justify-center items-center"
              style={{
                backgroundColor: checked ? '#6200E8' : 'transparent',
                borderColor: erroChecked ? '#f01' : '#000',
              }}
            >
              {checked && (
                <Text style={{ color: '#FFF', fontWeight: 'bold' }}>✓</Text>
              )}
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigate('TermosCadastrosScreen')}
            className="pr-6"
          >
            <Text
              className="text-center text-xs"
              style={{ color: erroChecked ? '#f01' : '#000' }}
            >
              Se você está criando uma conta, leia e aceite os{' '}
              <Text className="text-[#296FF5]">
                {' '}
                Termos e Condições de uso
              </Text>
              , e a nossa{' '}
              <Text className="text-[#296FF5]">Política de privacidade.</Text>
            </Text>
          </TouchableOpacity>
        </View>
        <View className="mt-8">
          <FilledButton
            title="Cadastrar"
            onPress={() => postPessoaFisica()}
          />
        </View>
      </ScrollView>
    </MainLayoutSecondary>
  );
}

import { api } from '../../../service/api';
import Toast from 'react-native-toast-message';
import { ScrollView, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useNavigate } from '../../../hooks/useNavigate';
import ButtonPerfil from '../../../components/buttons/ButtonPerfil';
import InputDisabled from '../../../components/forms/InputDisabled';
import FilledButton from '../../../components/buttons/FilledButton';
import InputOutlined from '../../../components/forms/InputOutlined';
import AsyncStorage from '@react-native-async-storage/async-storage';
import InputMascaraPaper from '../../../components/forms/InputMascaraPaper';
import MainLayoutAutenticado from '../../../components/layout/MainLayoutAutenticado';

export default function ClientePerfilInformacoesScreen() {
  const { goBack, navigate } = useNavigate();
  const [cpf, setCpf] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [email, setEmail] = useState('');
  const [editar, setEditar] = useState(false);
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');
  const [loading, setLoading] = useState(false);
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [nomeFantasia, setNomeFantasia] = useState('');
  const [categoriaPerfil, setCategoriaPerfil] = useState([]);
  const [nomeEmpresarial, setNomeEmpresarial] = useState('');

  async function getPerfil() {
    const jsonValue = await AsyncStorage.getItem('infos-user');

    if (jsonValue) {
      const newJson = JSON.parse(jsonValue);

      try {
        const response = await api.get(`/perfil/pessoa-juridica/${newJson.id}`);

        setNomeFantasia(response.data.results.nome_fantasia);
        setNomeEmpresarial(response.data.results.nome_empresarial);
        handleCNPJMask(response.data.results.cnpj);
        setEndereco(response.data.results.endereco);
        setEmail(response.data.results.email);
        handlePhoneMask(response.data.results.telefone);
        setNomeCompleto(response.data.results.nome_represetante);
        handleCPFMask(response.data.results.cpf_represetante);
        setCategoriaPerfil(response.data.results.perfil_id);
      } catch (error: any) {
        console.log('Error GET Perfil: ', error.response.data);
      }
    }
  }

  async function onSubmit() {
    setLoading(true);
    const jsonValue = await AsyncStorage.getItem('infos-user');

    if (jsonValue) {
      const newJson = JSON.parse(jsonValue);

      const headers = {
        Authorization: `Bearer ${newJson.token}`,
      };

      const formdata = {
        email: email,
        endereco: endereco,
        telefone: telefone,
        nome_fantasia: nomeFantasia,
        nome_representante: nomeCompleto,
        nome_empresarial: nomeEmpresarial,
      };

      try {
        const response = await api.post(`/altera/anunciante`, formdata, {
          headers: headers,
        });
        if (!response.data.error) {
          Toast.show({
            type: 'success',
            text1: 'Perfil atualizado !',
          });
          setEditar(false);
          navigate('ClientePerfilScreen');
        } else {
          Toast.show({
            type: 'error',
            text1: response.data.message ?? 'Ocorreu um erro, tente novamente!',
          });
        }
      } catch (error: any) {
        Toast.show({
          type: 'error',
          text1:
            error.response.data.erro ?? 'Ocorreu um erro, tente novamente!',
        });
        console.log(error);
      }
    }
    setLoading(false);
  }

  const handleCPFMask = (value: any) => {
    let cpf = value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{2})$/, '$1-$2');
    setCpf(cpf);
  };

  const handleCNPJMask = (value: any) => {
    let cnpj = value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{2})$/, '$1-$2');
    setCnpj(cnpj);
  };

  const handlePhoneMask = (value: any) => {
    let phone = value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .replace(/(\d{4})-(\d)(\d{4})/, '$1$2-$3');
    setTelefone(phone);
  };

  useEffect(() => {
    getPerfil();
  }, []);

  return (
    <MainLayoutAutenticado
      loading={loading}
      notScroll
      marginTop={20}
      marginHorizontal={16}
    >
      <ButtonPerfil
        mt={64}
        fontsize={24}
        onPress={() => navigate('ClientePerfilScreen')}
        title="Perfil - Informações"
        image={require('../../../../assets/img/icons/edit.png')}
      />
      <ScrollView>
        <View className="mt-6 mb-20">
          <InputOutlined
            mt={8}
            label="Nome fantasia"
            value={nomeFantasia}
            keyboardType={'default'}
            onChange={setNomeFantasia}
          />
          <InputDisabled
            mt={8}
            label="Nome empresarial"
            value={nomeEmpresarial}
            keyboardType={'default'}
            onChange={setNomeEmpresarial}
          />
          <InputDisabled
            mt={8}
            label="CNPJ"
            value={cnpj}
            keyboardType={'number-pad'}
          />
          <InputOutlined
            mt={8}
            label="Endereço"
            value={endereco}
            onChange={setEndereco}
            keyboardType={'default'}
          />
          <InputOutlined
            mt={8}
            label="E-mail"
            value={email}
            onChange={setEmail}
            keyboardType={'email-address'}
          />
          <InputOutlined
            mt={8}
            maxLength={15}
            label="Telefone (DDD)"
            value={telefone}
            keyboardType={'number-pad'}
            onChange={(text: string) => handlePhoneMask(text)}
          />
          <InputDisabled
            mt={8}
            label="Nome representante da empresa"
            value={nomeCompleto}
            keyboardType={'default'}
            onChange={setNomeCompleto}
          />
          <InputDisabled
            mt={8}
            label="CPF representante da empresa"
            value={cpf}
            keyboardType={'number-pad'}
          />
          {/* {categoriaPerfil &&
            categoriaPerfil.map((item: any, index: any) => (
              <InputDisabled
                key={index}
                mt={8}
                label="Categoria"
                value={item.categorias}
                keyboardType={'default'}
              />
            ))} */}

          <View className="w-full mt-8">
            <FilledButton title="Salvar" onPress={onSubmit} />
          </View>
        </View>
      </ScrollView>
    </MainLayoutAutenticado>
  );
}

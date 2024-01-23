import React, { useState, useEffect } from "react";
import { Table, Input, Button, Select, Space, DatePicker, message } from "antd";
import axios from "axios";

const { Column } = Table;
const { Option } = Select;

const GeradorCNAB150 = () => {
    const [banco, setBanco] = useState("");
    const [vencimento, setVencimento] = useState("");
    const [dadosDoadores, setDadosDoadores] = useState([]);

    const handleChangeBanco = (value) => {
        setBanco(value);
    };

    const handleChangeVencimento = (date, dateString) => {
        setVencimento(dateString);
    };

    const handleDownload = async () => {
        try {
            const scriptBanco = banco + "_gera_rem.php";
            const url = `${import.meta.env.VITE_URL_AXIOS}/backend/${scriptBanco}`;

            const dataAtual = new Date();
            const dataFormatadaAtual =
                dataAtual.getFullYear().toString() +
                ("0" + (dataAtual.getMonth() + 1)).slice(-2) +
                ("0" + dataAtual.getDate()).slice(-2);

            const newVencimento = vencimento.split('/').reverse().join('-');

            console.log("Vencimento: ", newVencimento);

            const dataFormatada = newVencimento.replace(/-/g, "");

            const formData = new FormData();
            formData.append("nome_banco", banco);
            formData.append("vencimento", dataFormatada);

            const response = await axios.post(url, formData, {
                responseType: "blob",
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            const blob = new Blob([response.data], {
                type: "application/octet-stream",
            });
            const blobUrl = window.URL.createObjectURL(blob);

            const downloadLink = document.createElement("a");
            downloadLink.href = blobUrl;
            const nomeArquivo = banco + dataFormatadaAtual + ".REM";
            downloadLink.download = nomeArquivo;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        } catch (error) {
            message.error("Erro ao baixar o arquivo.");
        }
    };

    const columns = [
        {
            title: "Nome",
            dataIndex: "nome",
            key: "nome",
            width: 250,
        },
        {
            title: "CPF/CNPJ",
            dataIndex: "cpf",
            key: "cpf",
            width: 150,
        },
        {
            title: "Banco",
            dataIndex: "banco",
            key: "banco",
            width: 70,
        },
        {
            title: "Agência",
            dataIndex: "agencia",
            key: "agencia",
            width: 70,
        },
        {
            title: "Conta",
            dataIndex: "conta_corrente",
            key: "conta_corrente",
            width: 120,
        },
        {
            title: "DV",
            dataIndex: "digito_conta",
            key: "digito_conta",
            width: 30,
        },
        {
            title: "Valor",
            dataIndex: "valor",
            key: "valor",
            width: 90,
            render: (text) => {
                return new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                }).format(text);
            },
        },
    ];

    useEffect(() => {
        axios
            .get(`${import.meta.env.VITE_URL_AXIOS}/backend/consulta_doadores.php`)
            .then((response) => {
                setDadosDoadores(response.data);
            });
    }, []);

    return (
        <div style={{ width: "70%", margin: '30px auto' }}>

            <Space style={{ marginBottom: 16 }}>
                <Select
                    style={{ width: 200 }}
                    placeholder="Banco"
                    value={banco}
                    onChange={handleChangeBanco}
                >
                    <Option value="">Selecionar Banco</Option>
                    <Option value="ITAU">Itaú</Option>
                    {/* <Option value="BANRISUL">Banrisul</Option>
                        <Option value="CAIXA">Caixa</Option> */}
                </Select>
                <DatePicker
                    style={{ width: 200 }}
                    placeholder="Vencimento"
                    onChange={handleChangeVencimento}
                    format={"DD/MM/YYYY"}
                />
                <Button type="primary" onClick={handleDownload}>
                    Gerar arquivo remessa
                </Button>
            </Space>
            <Table
                style={{ marginTop: 20 }}
                dataSource={dadosDoadores}
                columns={columns}
                pagination={{ pageSizeOptions: [5, 10, 20, 50, 100], pageSize: 10 }}
                scroll={{ x: "max-content" }}
            />
        </div>
    );
};

export default GeradorCNAB150;

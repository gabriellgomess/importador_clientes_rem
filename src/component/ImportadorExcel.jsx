import React, { useState, useEffect } from "react";
import { Button, Upload, message, Badge, Card, Select, Spin } from "antd";
import { UploadOutlined, CloseOutlined, FileExcelOutlined } from "@ant-design/icons";
import axios from "axios";

const ImportadorExcel = () => {
    const [file, setFile] = useState(null);
    const [parceiro, setParceiro] = useState("");
    const [parceiros, setParceiros] = useState([]);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState("");

    const handleChangeParceiro = (value) => {
        setParceiro(value);
    };

    const beforeUpload = (file) => {
        setFile(file);
        return false;
    };

    const handleRemoveFile = () => {
        setFile(null);
    };

    const handleSend = () => {
        if (!file) {
            message.error("Nenhum arquivo selecionado");
            return;
        }
        setLoading(true);
        const formData = new FormData();
        formData.append("excelFile", file);
        formData.append("parceiro", parceiro);
        formData.append("user", user);

        axios
            .post(`${import.meta.env.VITE_URL_AXIOS}/backend/processa_excel.php`, formData)
            .then((res) => {
                console.log(res);
                if (res.data.success) {
                    message.success(res.data.message);
                    setFile(null); // Clear the input
                    setLoading(false);
                    // window.location.href = `${import.meta.env.VITE_URL}/sistema/index.php/debito-automatico/gerador-de-arquivo-remessa`;

                } else {
                    if (res.data.message) {
                        message.error(res.data.message);
                        setFile(null); // Clear the input
                        // direciona para /sistema/index.php/debito-automatico/gerador-de-arquivo-remessa


                        setLoading(false);

                    } else {
                        message.error("Erro ao enviar o arquivo");
                        setFile(null); // Clear the input
                        setLoading(false);
                    }

                }

            })
            .catch((err) => {
                console.log(err);
                message.error("Erro ao enviar o arquivo");
            });
    };

    useEffect(() => {
        axios
            .get(`${import.meta.env.VITE_URL_AXIOS}/backend/lista_parceiros.php`)
            .then((response) => {
                setParceiros(response.data);
            });
    }, []);

    useEffect(()=>{
        // Pegar user em session storage
        const username = sessionStorage.getItem('user');
        setUser(username);        
        
    }, [])
    
    

    return (
        <div style={{ width: "70%", margin: "30px auto", display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Card style={{ width: '100%' }}>
                <p>
                    Selecione o parceiro para o qual será importada a planilha.
                </p>
                <p>
                    Selecione um arquivo Excel com os dados a serem importados. O arquivo deve conter uma planilha com os dados na seguinte ordem, sendo a primeira linha o cabeçalho, o nome das colunas não importa, mas a ordem sim:
                </p>

                <p>Nome, CPF, Valor, Banco, Agência, Conta, Dígito, Vencimento, Código da Proposta</p>
                <p>
                    <strong>Atenção:</strong> O arquivo deve estar no formato <strong>.xlsx</strong> ou <strong>.xls</strong>
                </p>
            </Card>
            <div style={{ display: "flex", gap: "10px" }}>
                <Select
                    style={{ width: 400 }}
                    placeholder="Parceiro"
                    value={parceiro}
                    onChange={handleChangeParceiro}
                >
                    <Option value="">Selecionar o Parceiro</Option>
                    {parceiros?.map((parceiro) => (
                        <Option key={parceiro.id} value={parceiro.id}>
                            {parceiro.nome}
                        </Option>
                    ))}
                </Select>
                <Upload
                    beforeUpload={beforeUpload}
                    showUploadList={false}
                    accept=".xlsx, .xls"
                >
                    <Button icon={<UploadOutlined />}>Selecionar arquivo</Button>
                </Upload>
                <Button style={{width: '120px'}} type="primary" onClick={handleSend}>
                    {loading ? (<span style={{display: 'flex', gap: '5px', alignItems: 'center'}}>Enviando... <Spin size="small" /></span>) : "Enviar"}
                </Button>
            </div>
            <div style={{ display: "flex", gap: "10px", height: '50px' }}>
                {file && (
                    <Badge
                        count={
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#fff' }}>
                                <FileExcelOutlined />{file.name}{" "}
                                <CloseOutlined
                                    onClick={handleRemoveFile}
                                    style={{ color: "##fff", cursor: "pointer", fontWeight: 'bold' }}
                                />
                            </div>
                        }
                        style={{
                            backgroundColor: '#2d8104',
                            padding: '5px',
                            borderRadius: '5px',
                        }}
                    />
                )}
            </div>

        </div>
    );
};

export default ImportadorExcel;

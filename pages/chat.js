import React from 'react';
import { useRouter } from 'next/router';

import { Box, Text, TextField, Image, Button } from '@skynexui/components';
import { createClient } from '@supabase/supabase-js'

import appConfig from '../config.json';
import { environment } from '../environments/environments';
import { ButtonSendSticker } from '../src/components/buttonSendSticker';

const supabaseClient = createClient(environment.SUPASE_URL, environment.SUPABASE_ANON_KEY);

function realTimeMessagesListener(handleNewMessage) {
    supabaseClient
        .from('messageList')
        .on('INSERT', (data) => {
            handleNewMessage(data.new);
        })
        .subscribe();

}

export default function ChatPage() {
    const router = useRouter();
    const username = router?.query?.username;
    const [message, setmessage] = React.useState('');
    const [messageList, setMessageList] = React.useState([

    ]);

    React.useEffect(() => {
        supabaseClient
            .from('messageList')
            .select('*')
            .order('id', { ascending: false })
        .then(({ data }) => setMessageList(data))
        const subscription = realTimeMessagesListener((newMessage) => {
            // console.log('Nova mensagem:', newMessage);
            // console.log('listaDeMensagens:', messageList);
            // Quero reusar um valor de referencia (objeto/array)
            // Passar uma função pro setState

            // setmessageList([
            //     newMessage,
            //     ...messageList
            // ])
            setMessageList((newList) => {
                // console.log('newList:', newList);
                return [
                    newMessage,
                    ...newList,
                ]
            });
        });

        return () => {
            subscription.unsubscribe();
        }
    }, []);


    /*
    // Usuário
    - Usuário digita no campo textarea
    - Aperta enter para enviar
    - Tem que adicionar o texto na listagem

    // Dev
    - [X] Campo criado
    - [X] Vamos usar o onChange usa o useState (ter if pra caso seja enter pra limpar a variavel)
    - [X] Lista de mensagens
    */
    function handleNewMessage(newMessage) {
        const message = {
            from: username,
            text: newMessage,
        };

        supabaseClient
            .from('messageList')
            .insert([message])
            .then(({ data }) => {
                // setMessageList([
                //     data[0],
                //     ...messageList,
                // ]);
            });

        setmessage('');
    }

    return (
        <Box
            styleSheet={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: appConfig.theme.colors.primary[500],
                backgroundImage: `url(https://virtualbackgrounds.site/wp-content/uploads/2020/08/the-matrix-digital-rain.jpg)`,
                backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundBlendMode: 'multiply',
                color: appConfig.theme.colors.neutrals['000']
            }}
        >
            <Box
                styleSheet={{
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    boxShadow: '0 2px 10px 0 rgb(0 0 0 / 20%)',
                    borderRadius: '5px',
                    backgroundColor: appConfig.theme.colors.neutrals[700],
                    height: '100%',
                    maxWidth: '95%',
                    maxHeight: '95vh',
                    padding: '32px',
                }}
            >
                <Header />
                <Box
                    styleSheet={{
                        position: 'relative',
                        display: 'flex',
                        flex: 1,
                        height: '80%',
                        backgroundColor: appConfig.theme.colors.neutrals[600],
                        flexDirection: 'column',
                        borderRadius: '5px',
                        padding: '16px',
                    }}
                >
                    <MessageList mensagens={messageList} />
                    {/* {messageList.map((messageAtual) => {
                        return (
                            <li key={messageAtual.id}>
                                {messageAtual.from}: {messageAtual.text}
                            </li>
                        )
                    })} */}
                    <Box
                        as="form"
                        styleSheet={{
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <TextField
                            value={message}
                            onChange={(event) => {
                                const valor = event.target.value;
                                setmessage(valor);
                            }}
                            onKeyPress={(event) => {
                                if (event.key === 'Enter') {
                                    event.preventDefault();
                                    handleNewMessage(message);
                                }
                            }}
                            placeholder="Insira sua message aqui..."
                            type="textarea"
                            styleSheet={{
                                width: '100%',
                                border: '0',
                                resize: 'none',
                                borderRadius: '5px',
                                padding: '6px 8px',
                                backgroundColor: appConfig.theme.colors.neutrals[800],
                                marginRight: '12px',
                                color: appConfig.theme.colors.neutrals[200],
                            }}
                        />
                        <ButtonSendSticker
                            // callback
                            onStickerClick={(sticker) => {
                                // console.log('[USANDO O COMPONENTE] Salva esse sticker no banco', sticker);
                                handleNewMessage(':sticker: ' + sticker);
                            }}
                        />
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}

function Header() {
    return (
        <>
            <Box styleSheet={{ width: '100%', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} >
                <Text variant='heading5'>
                    Chat
                </Text>
                <Button
                    variant='tertiary'
                    colorVariant='neutral'
                    label='Logout'
                    href="/"
                />
            </Box>
        </>
    )
}

function MessageList(props) {
    // console.log(props);
    return (
        <Box
            tag="ul"
            styleSheet={{
                overflow: 'scroll',
                display: 'flex',
                flexDirection: 'column-reverse',
                flex: 1,
                color: appConfig.theme.colors.neutrals["000"],
                marginBottom: '16px',
            }}
        >
            {props.mensagens.map((message) => {
                return (
                    <Text
                        key={message.id}
                        tag="li"
                        styleSheet={{
                            borderRadius: '5px',
                            padding: '6px',
                            marginBottom: '12px',
                            hover: {
                                backgroundColor: appConfig.theme.colors.neutrals[700],
                            }
                        }}
                    >
                        <Box
                            styleSheet={{
                                marginBottom: '8px',
                            }}
                        >
                            <Image
                                styleSheet={{
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '50%',
                                    display: 'inline-block',
                                    marginRight: '8px',
                                }}
                                src={`https://github.com/${message.from}.png`}
                            />
                            <Text tag="strong">
                                {message.from}
                            </Text>
                            <Text
                                styleSheet={{
                                    fontSize: '10px',
                                    marginLeft: '8px',
                                    color: appConfig.theme.colors.neutrals[300],
                                }}
                                tag="span"
                            >
                                {(new Date().toLocaleDateString())}
                            </Text>
                        </Box>

                        {message.text.startsWith(':sticker:')
                            ? (
                                <Image src={message.text.replace(':sticker:', '')} />
                            )
                            : (
                                message.text
                            )}
                    </Text>
                );
            })}
        </Box>
    )
}

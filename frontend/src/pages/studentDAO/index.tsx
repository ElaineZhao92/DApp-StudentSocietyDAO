import {Button, Image, List, Divider, InputNumber, Input, Space, Avatar} from 'antd';
import {HistoryOutlined, EllipsisOutlined, UserOutlined} from "@ant-design/icons";
import {Header} from "../../pic"
import {useEffect, useState, createElement} from 'react';
import {studentDAOContract, myERC20Contract, web3} from "../../utils/contracts";
import React from 'react';
import './index.css';

const GanacheTestChainId = '0x539' // Ganache默认的ChainId = 0x539 = Hex(1337)
const GanacheTestChainName = 'Ganache Test Chain'
const GanacheTestChainRpcUrl = 'http://127.0.0.1:8545'
const { TextArea } = Input;

interface Proposal {
    index:number;      // index of this proposal
    startTime: number; // proposal start time
    duration: number;  // proposal duration
    name: string;      // proposal name
    proposer: string;  //proposer name
    approvement:number;
    disapprovement:number;
}

const StudentDAOPage = () => {
    /* ---- account/user or manager ---- */
    const [account, setAccount] = useState('')
    const [accountBalance, setAccountBalance] = useState(0)
    const [voteAmount, setVoteAmount] = useState(0)
    const [manager, setManager] = useState('') //manager acount
    const [studentNumber, setStudentNumber] = useState(0)
    /* ---- proposal ---- */
    const [proposeName, setProposeName] = useState('')
    const [proposer, setProposer] = useState('')
    const [totalProposalAmount, setTotalProposalAmount] = useState(0)
    const [proposalList, setProposalList] = useState<Proposal[]>([])
    const [duration, setDuration] = useState(0)
    /* ---- const ----*/
    const [costForVote, setCostForVote] = useState(0)
    const [costForPropose, setCostForPropose] = useState(0)
    /* ---- flag ---- */
    const [flag, setFlag] = useState(0)
    /* ---- other settings ---- */

    const ProposalTableList = ({ start, duration,approvement, disapprovement, proposer }: { start: number; duration:number; approvement:number; disapprovement:number ; proposer: string}) => (
        <div>
            <div style = {{color:'#102a43'}}>
                <Avatar style={{ backgroundColor: '#00a2ae', verticalAlign: 'middle' }} size="large" >
                    <b>{proposer}</b>
                </Avatar>&nbsp;&nbsp;
                支持: <b>{approvement}</b>票 &nbsp;&nbsp;&nbsp;&nbsp;反对: <b>{disapprovement}</b>票</div>
            
            <Space>
                <div></div>
                <div></div>
                {createElement(HistoryOutlined)}
                {new Date(start * 1000).toLocaleString()}
                {createElement(EllipsisOutlined)}
                <div></div>
                <div></div>
                {new Date(start * 1000 + duration * 1000).toLocaleString()}
            </Space>
        </div>
        
      );
      

    useEffect(() => {
        // 初始化检查用户是否已经连接钱包
        // 查看window对象里是否存在ethereum（metamask安装后注入的）对象
        const initCheckAccounts = async () => {
            // @ts-ignore
            const {ethereum} = window;
            if (Boolean(ethereum && ethereum.isMetaMask)) {
                // 尝试获取连接的用户账户
                const accounts = await web3.eth.getAccounts()
                if(accounts && accounts.length) {
                    setAccount(accounts[0])
                }
            }
        }

        initCheckAccounts()
    }, [])

    useEffect(() => {
        const updateProposalAmount = async () => {
            const proposal_num = await studentDAOContract.methods.getProposalNum().call()
            const student_num = await studentDAOContract.methods.getStudentNumber().call()
            setTotalProposalAmount(proposal_num)
            setStudentNumber(student_num)
        }

        const updateCost = async() => {
            const voteCost = await studentDAOContract.methods.getVoteCost().call()
            const proposeCost = await studentDAOContract.methods.getProposeCost().call()
            const manager = await studentDAOContract.methods.manager().call()
            setCostForVote(voteCost)
            setCostForPropose(proposeCost)
            setManager(manager)
        }

        const getAccountInfo = async () => {
            if (myERC20Contract) {
                const ab = await myERC20Contract.methods.balanceOf(account).call()
                setAccountBalance(ab)
            } else {
                alert('Contract not exists.')
            }
        }

        updateProposalAmount()
        updateCost()
        if(account !== '') {
            getAccountInfo()
        }
    }, [flag, account])


    useEffect(()=> {
        // 获取提案详细信息
        const updateProposalList = async () => {
            let prop: Proposal[] = []
            for (var i = 1; i <= totalProposalAmount; i++) {
                const proposal_name = await studentDAOContract.methods.getProposalName(i).call()
                const proposer = await studentDAOContract.methods.getProposerName(i).call()
                const approvement = await studentDAOContract.methods.getApprovement(i).call()
                const disapprovement = await studentDAOContract.methods.getDisapprovement(i).call()
                const startTime = await studentDAOContract.methods.getStartTime(i).call()
                const duration = await studentDAOContract.methods.getDuration(i).call()
                prop.push({index: i, name: proposal_name, startTime: startTime, duration: duration, approvement: approvement, disapprovement: disapprovement, proposer:proposer})
            }
            setProposalList(prop)
        }

        updateProposalList()
    }, [totalProposalAmount, flag])

    useEffect(() => {
    }, [account])

    const onClaimTokenAirdrop = async () =>{
        if(account === ''){
            alert('请先通过小狐狸连接钱包～');
            return 
        }
        if(myERC20Contract){
            try{
                await myERC20Contract.methods.airdrop().send({
                    from: account
                })
                alert('领取成功啦～恭喜您获得1000通证积分, 可以用来提出提案或者投票哦')
            } catch (error: any) {
                alert(error.message)
            }
        } else {
            alert('不存在合约账户.')
        }
    }
 
    const onVote = (approvement: boolean, index: number) => {
        return async (e: any) => {
            if(account === '') {
                alert('请先通过小狐狸连接钱包～')
                return
            }
            if(studentDAOContract && myERC20Contract){
                try {
                    await myERC20Contract.methods.approve(studentDAOContract.options.address, 100).send({
                        from: account
                    })
                    await studentDAOContract.methods.vote(index, approvement, costForVote).send({
                        from: account
                    })
                    alert('您成功投票')
                } catch (error: any) {
                    alert(error.message)
                }
            } else {
                alert('不存在合约账户.')
            }
        }
    }
    const onDecideProposal = (index: number) => {
        return async (e:any) => {
            if(account === '') {
                alert('请先通过小狐狸连接钱包～')
                return
            } 
            if (studentDAOContract && myERC20Contract) {
                try {
                    await studentDAOContract.methods.DecideProposal(index).send({
                        from: account
                    })
                    alert('公布结果!')
                } catch (error: any) {
                    alert(error.message)
                }
            } else {
                alert('不存在合约账户.')
            }
        }
    }

    const getTime = (item:Proposal) => {
        return new Date().getTime() >= (BigInt(item.startTime) + BigInt(item.duration)) * BigInt(1000);
    }

    const onClickConnectWallet = async () => {
        // 查看window对象里是否存在ethereum（metamask安装后注入的）对象
        // @ts-ignore
        const {ethereum} = window;
        if (!Boolean(ethereum && ethereum.isMetaMask)) {
            alert('MetaMask is not installed!');
            return
        }

        try {
            // 如果当前小狐狸不在本地链上，切换Metamask到本地测试链
            if (ethereum.chainId !== GanacheTestChainId) {
                const chain = {
                    chainId: GanacheTestChainId, // Chain-ID
                    chainName: GanacheTestChainName, // Chain-Name
                    rpcUrls: [GanacheTestChainRpcUrl], // RPC-URL
                };

                try {
                    // 尝试切换到本地网络
                    await ethereum.request({method: "wallet_switchEthereumChain", params: [{chainId: chain.chainId}]})
                } catch (switchError: any) {
                    // 如果本地网络没有添加到Metamask中，添加该网络
                    if (switchError.code === 4902) {
                        await ethereum.request({ method: 'wallet_addEthereumChain', params: [chain]
                        });
                    }
                }
            }
            // 小狐狸成功切换网络了，接下来让小狐狸请求用户的授权
            await ethereum.request({method: 'eth_requestAccounts'});
            // 获取小狐狸拿到的授权用户列表
            const accounts = await ethereum.request({method: 'eth_accounts'});
            // 如果用户存在，展示其account，否则显示错误信息
            setAccount(accounts[0] || 'Not able to get accounts');
        } catch (error: any) {
            alert(error.message)
        }
    }

    const onCreateProposal = async () => {
        if(account === '') {
            alert('You have not connected wallet yet.')
            return
        }

        if (myERC20Contract && studentDAOContract) {
            try {
                if (proposeName === ''){
                    alert('提案名称不能为空')
                }
                await myERC20Contract.methods.approve(studentDAOContract.options.address, voteAmount).send({
                    from: account
                })

                await studentDAOContract.methods.createProposal(voteAmount, proposeName, duration, proposer).send({
                    from: account
                })

                alert('提案发布成功')
                setFlag(1 - flag)
            } catch (error: any) {
                alert(error.message)
            }
        } else {
            alert('合约不存在')
        }
    }

    return (
        <div className='container'>
            <Image width='70%' height='130px' preview={false} src={Header} />
            <div className='main'>
                <h2 style = {{color:'#0a6c74'}}>去中心化学生社团组织管理平台</h2>
                <h1 style = {{color:'#14919b'}}>studentDAO</h1>
                <div style = {{color:'#14919b'}} >管理员地址：<span style = {{color:'#044e54'}}>{manager}</span></div>
                <div className='account'>
                    {account === '' && <Button onClick={onClickConnectWallet}>连接钱包</Button>}
                    <div style = {{color:'#14919b'}}>当前用户：<span style = {{color:'#044e54'}}>{account === '' ? '无用户连接' : account}</span></div>
                    <Button onClick={onClaimTokenAirdrop} style = {{color:'#044e54'}}>领取通证积分</Button>
                    <div style = {{color:'#14919b'}}>当前用户拥有通证积分: <span style = {{color:'#044e54'}}>{account === '' ? 0 : accountBalance}</span></div>
                    <div><h5></h5></div>
                    <div style = {{color:'#14919b'}}>
                        <span style = {{color:'#044e54'}}>Tips: </span>通证积分可以用来投票、提出proposal等
                    </div>
                </div>
                <div style = {{color:'#14919b'}}>花费 <span style = {{color:'#044e54'}}>{voteAmount}</span> 通证积分即可提出提案</div>
                <div style = {{color:'#14919b'}}>花费 <span style = {{color:'#044e54'}}>{100}</span> 通证积分即可为提案投赞成/反对票</div>
                <div style = {{color:'#14919b'}}>
                    <UserOutlined /> 已有 <span style = {{color:'#044e54'}}>{studentNumber} </span>人/次参与投票
                </div>
                <div style = {{color:'#14919b'}}>
                    已经有 <span style = {{color:'#044e54'}}>{totalProposalAmount} </span>个提案
                </div>
                <div className='operation'>
                    <Divider />
                    <div><h3 style = {{color:'#044e54'}}>请输入您的提案</h3></div>
                    <div className='propose'>
                        <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
                            <Space>
                                <Input showCount maxLength = {200} onChange={(e) => setProposeName(e.target.value)} placeholder="提案内容" allowClear 
                                    style={{width:'382px'}}/>
                                <Input onChange={(e) => setProposer(e.target.value)} placeholder="您的姓名" />
                            </Space>
                            
                            <Space>
                                <InputNumber min={costForPropose} step={costForVote} 
                                    onChange={(e)=>setVoteAmount(e!)} 
                                    addonAfter="Tokens" 
                                    placeholder="投入通证积分的个数" />
                                <InputNumber min={20} 
                                    onChange={(e)=>setDuration(e!)} 
                                    addonAfter="秒" placeholder="有效时间" />
                                <Button onClick={onCreateProposal}>提出建议</Button>
                            </Space>
                        </Space>
                    </div>
                    <Divider />
                    <div className='proposals'>
                        <List
                        size="small"
                        bordered
                        header={<div style = {{color:'#14919b'}}>当前总建议数：<span style = {{color:'#14919b'}}>{account === '' ? 0 : totalProposalAmount} </span></div>}
                        footer={<div style = {{color:'#14919b'}}>Proposal List real-time updates</div>}
                        dataSource={proposalList}
                        renderItem={proposal => (
                            <List.Item
                            actions={[<Button onClick={onVote(true, proposal.index)}>支持</Button>,
                                      <Button onClick={onVote(false, proposal.index)}>反对</Button>,
                                        account == manager && getTime(proposal) && <Button onClick={onDecideProposal(proposal.index)}>结算</Button>
                                        ]}
                            style={{
                                backgroundColor: getTime(proposal) ? ((proposal.approvement >= proposal.disapprovement)?"#bed742a5":"#ef973ea5")
                             : "#f4e1b4"}}
                            >
                                <List.Item.Meta
                                title={proposal.name}
                                description={<ProposalTableList start={proposal.startTime} duration={proposal.duration}
                                            approvement = {proposal.approvement} disapprovement = {proposal.disapprovement} proposer = {proposal.proposer}/>}
                                />
                            </List.Item>)}
                        />
                    </div>
                </div>
                <Divider />
            </div>
        </div>
    )
}


export default StudentDAOPage

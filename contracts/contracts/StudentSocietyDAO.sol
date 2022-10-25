// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./MyERC20.sol";
// Uncomment the line to use openzeppelin/ERC20
// You can use this dependency directly because it has been installed already
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// Uncomment this line to use console.log
// import "hardhat/console.sol";


contract StudentSocietyDAO {

    // use a event if you want
    event ProposalInitiated(uint32 proposalIndex);

    address[] public student;   // 学生
    address public winner;      // 提案者(获得分数最高的)
    MyERC20 public studentERC20;// 相关的代币合约
    uint32 pro_num;

    struct Proposal {
        uint32 index;      // index of this proposal
        address proposer;  // who make this proposal
        uint256 startTime; // proposal start time
        uint256 duration;  // proposal duration
        string name;       // proposal name
        uint32 approvement;
        uint32 disapprovement;
    }

    mapping(uint32 => Proposal) proposals; // A map from proposal index to proposal
    
    // ...
    // TODO add any variables if you want

    constructor() {
        // maybe you need a constructor
        studentERC20 = new MyERC20("StudentDAO", "ERC");
        pro_num = 0;
    }

    function helloworld() pure external returns(string memory) {
        return "hello world";
    }

    // 获得参与者数量
    function getStudentNumber() view external returns (uint256){
        return student.length;
    }
    // 获得提议者的交易地址
    function getProposerAddress(uint32 index) view external returns (address){
        return proposals[index].proposer;
    }
    // 获得proposal的开始时间
    function getStartTime(uint32 index) view external returns (uint256){
        return proposals[index].startTime;
    }
    // 获得投票的周期
    function getDuration(uint32 index) view external returns (uint256){
        return proposals[index].duration;
    }

    

    // 投票 转通证积分
    function vote(uint32 index, uint32 vote_, uint32 amount) public {
        // 委托转账操作
        for(uint32 i = 0; i < pro_num; i++){
            DecideProposal(i);
        }
        if(amount < 100)
            revert("Unaffordable! Please get more token");
        if(index > pro_num || block.timestamp > proposals[index].duration + proposals[index].startTime)
            revert("Proposal not found. It may has ended!");
        studentERC20.transferFrom(msg.sender, address(this), 100);//花费100进行投票
        // 把参与者加入到投票人中
        student.push(msg.sender);
        Proposal storage prop_ = proposals[index];
        if(vote_ > 0){//approvement
            prop_.approvement ++;
        }
        else if(vote_ < 0){
            prop_.disapprovement ++;
        }else
            revert("Unvalid vote");
    }

    function setTimer(uint256 startTime, uint256 duration) public view returns (bool){
        if(block.timestamp >= duration + startTime) //stop
            return true;
        else 
            return false;
    }

    function createProposal(uint32 amount, string memory name, uint256 duration) public 
        returns(uint32 proposalIndex){
        //发布
        if(amount < 300)
            revert("Unaffordable! Please get more token");
        //对所有的proposal进行分析
        for(uint32 i = 0; i < pro_num; i++){
            DecideProposal(i);
        }
        studentERC20.transferFrom(msg.sender, address(this), 300);
        pro_num ++;
        proposals[pro_num].index = pro_num;
        proposals[pro_num].name = name;
        proposals[pro_num].proposer = msg.sender;
        proposals[pro_num].approvement = 0;
        proposals[pro_num].disapprovement = 0;
        proposals[pro_num].startTime = block.timestamp;
        proposals[pro_num].duration = duration;  //2min
        emit ProposalInitiated(pro_num);
        return pro_num;

    }

    function DecideProposal(uint32 index) public{
        Proposal storage prop_ = proposals[index];
        if(prop_.approvement >= prop_.disapprovement && setTimer(prop_.startTime,prop_.duration)){
            studentERC20.transfer(prop_.proposer, 1000);//对提议提出者转账1000通行证
            revert("Approve!!!");
        }
        else if(prop_.approvement < prop_.disapprovement && setTimer(prop_.startTime,prop_.duration)){
            revert("Disapprove!!!");
        }
    }
}
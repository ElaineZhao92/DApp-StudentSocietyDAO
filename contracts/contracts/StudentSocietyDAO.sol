// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./MyERC20.sol";
import "./MyERC721.sol";
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
    MyERC721 public studentERC721; //相关NFT合约
    uint32 pro_num;
    uint32 constant voteCost = 100;
    uint32 constant proposeCost = 300;
    uint32 constant maxVote = 5;

    struct Proposal {
        uint32 index;      // index of this proposal
        address proposer;  // who make this proposal
        uint256 startTime; // proposal start time
        uint256 duration;  // proposal duration
        string name;       // proposal name
        string proposerName;
        uint32 approvement;
        uint32 disapprovement;
        mapping(address => uint32) times; //proposal time
        bool publishment;  // proposal publish or not
    }

    address public manager;
    mapping(uint32 => Proposal) proposals; // A map from proposal index to proposal
    mapping(address => uint32) published_proposals_; // A  map from proposer to the num of proposals he published
    mapping(address => uint256) tokenId;
    // ...
    // TODO add any variables if you want

    constructor() {
        // maybe you need a constructor
        studentERC20 = new MyERC20("StudentDAO", "ERC");
        studentERC721 = new MyERC721("StudentDAO", "NFT");
        pro_num = 0;
        manager = msg.sender;
    }
    
    modifier onlyManager {
        require(msg.sender == manager);
        _;
    }

    // 获得proposal总数
    function getProposalNum() view external returns (uint256){
        return pro_num;
    }
    // 获得参与者数量
    function getStudentNumber() view external returns (uint256){
        return student.length;
    }
    // 获得提案人名字
    function getProposerName(uint32 index) view external returns(string memory){
        return proposals[index].proposerName;
    }
    // 获得proposeCost
    function getProposeCost()external pure returns (uint32){
        return proposeCost;
    }
    // 获得proposeCost
    function getVoteCost()external pure returns (uint32){
        return voteCost;
    }
    function getProposalName(uint32 index) view external returns (string memory){
        return proposals[index].name;
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
    // 获得同意的票数
    function getApprovement(uint32 index) external view returns (uint32){
        return proposals[index].approvement;
    }
    // 获得不同意的票数
    function getDisapprovement(uint32 index) external view returns (uint32){
        return proposals[index].disapprovement;
    }
    // 获得该地址得到的tokenid
    function getTokenId(address proposer) public view returns(uint256){
        return tokenId[proposer];
    }

    // 投票 转通证积分
    function vote(uint32 index, bool vote_, uint32 amount) public {
        
        if(amount < voteCost)
            revert("Unaffordable! Please get more token");
        if(index > pro_num || block.timestamp > proposals[index].duration + proposals[index].startTime)
            revert("Proposal not found. It may has ended!");
        studentERC20.transferFrom(msg.sender, address(this), amount);//花费100进行投票
        // 把参与者加入到投票人中
        student.push(msg.sender);
        Proposal storage prop_ = proposals[index];
        if(vote_){//approvement
            prop_.approvement += amount / voteCost;
        }
        else{
            prop_.disapprovement += amount / voteCost;
        }
        prop_.times[msg.sender] += amount / voteCost;
    }

    function setTimer(uint256 startTime, uint256 duration) public view returns (bool){
        if(block.timestamp >= duration + startTime) //stop
            return true;
        else 
            return false;
    }

    function createProposal(uint32 amount, string memory name, uint256 duration, string memory proposerName) public 
        returns(uint32 proposalIndex){
        //发布
        if(amount < proposeCost)
            revert("Unaffordable! Please get more token");
        studentERC20.transferFrom(msg.sender, address(this), amount);
        pro_num ++;
        proposals[pro_num].index = pro_num;
        proposals[pro_num].name = name;
        proposals[pro_num].proposer = msg.sender;
        proposals[pro_num].proposerName = proposerName;
        proposals[pro_num].approvement = (amount - 300) / 100;
        proposals[pro_num].disapprovement = 0;
        proposals[pro_num].startTime = block.timestamp;
        proposals[pro_num].duration = duration;
        proposals[pro_num].times[msg.sender] = 0;
        proposals[pro_num].publishment = false;
        emit ProposalInitiated(pro_num);
        return pro_num;

    }

    function DecideProposal(uint32 index) public{
        require(block.timestamp >= proposals[index].startTime + proposals[index].duration);
        require(proposals[index].publishment == false);
        proposals[index].publishment = true;
        if(proposals[index].approvement >= proposals[index].disapprovement){
            // 对提议提出者转账所有的approvement通行证
            published_proposals_[proposals[index].proposer] += 1;
            studentERC20.transfer(proposals[index].proposer, proposals[index].approvement * voteCost);
            if(published_proposals_[proposals[index].proposer] == 3){
                // 随机分发一个tokenId, tokenId是0～10000的随机整数
                uint256 tokenid = rand_int256(10000);
                studentERC721.mint(proposals[index].proposer, tokenid);
                tokenId[proposals[index].proposer] = tokenid;
            }
        }  
    }
    
    function rand_int256(uint256 length) public view returns(uint256){
        uint256 hash = uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty)));
        return hash % length;
    }
}
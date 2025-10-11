// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title SafeGuardDetector
 * @dev On-chain contract for detecting potential rug-pull indicators
 * @notice This contract provides helper functions for analyzing token contracts
 */
contract SafeGuardDetector {
    
    struct TokenAnalysis {
        address tokenAddress;
        bool hasOwner;
        bool hasRenounced;
        uint256 creatorBalance;
        uint256 totalSupply;
        uint256 riskScore;
        uint256 timestamp;
    }
    
    mapping(address => TokenAnalysis) public tokenAnalyses;
    
    event TokenAnalyzed(
        address indexed token,
        uint256 riskScore,
        uint256 timestamp
    );
    
    /**
     * @dev Analyze a token contract for rug-pull indicators
     * @param tokenAddress The address of the token to analyze
     */
    function analyzeToken(address tokenAddress) external {
        require(tokenAddress != address(0), "Invalid token address");
        
        TokenAnalysis memory analysis;
        analysis.tokenAddress = tokenAddress;
        analysis.timestamp = block.timestamp;
        
        // Check if contract has owner function
        try this.checkOwnership(tokenAddress) returns (bool hasOwner, bool renounced) {
            analysis.hasOwner = hasOwner;
            analysis.hasRenounced = renounced;
        } catch {
            analysis.hasOwner = false;
            analysis.hasRenounced = true;
        }
        
        // Get token supply and creator balance
        try this.getTokenMetrics(tokenAddress) returns (uint256 totalSupply, uint256 creatorBalance) {
            analysis.totalSupply = totalSupply;
            analysis.creatorBalance = creatorBalance;
        } catch {
            analysis.totalSupply = 0;
            analysis.creatorBalance = 0;
        }
        
        // Calculate risk score
        analysis.riskScore = calculateRiskScore(analysis);
        
        tokenAnalyses[tokenAddress] = analysis;
        
        emit TokenAnalyzed(tokenAddress, analysis.riskScore, analysis.timestamp);
    }
    
    /**
     * @dev Check ownership status of a token
     */
    function checkOwnership(address tokenAddress) external view returns (bool hasOwner, bool renounced) {
        (bool success, bytes memory data) = tokenAddress.staticcall(
            abi.encodeWithSignature("owner()")
        );
        
        if (success && data.length >= 32) {
            address owner = abi.decode(data, (address));
            hasOwner = owner != address(0);
            renounced = owner == address(0);
        }
        
        return (hasOwner, renounced);
    }
    
    /**
     * @dev Get token metrics for analysis
     */
    function getTokenMetrics(address tokenAddress) external view returns (uint256 totalSupply, uint256 creatorBalance) {
        // Get total supply
        (bool success1, bytes memory data1) = tokenAddress.staticcall(
            abi.encodeWithSignature("totalSupply()")
        );
        
        if (success1 && data1.length >= 32) {
            totalSupply = abi.decode(data1, (uint256));
        }
        
        // Try to get creator balance (requires knowing creator address)
        // This would typically be passed as a parameter
        creatorBalance = 0; // Simplified for demo
        
        return (totalSupply, creatorBalance);
    }
    
    /**
     * @dev Calculate risk score based on analysis data
     */
    function calculateRiskScore(TokenAnalysis memory analysis) internal pure returns (uint256) {
        uint256 score = 0;
        
        // Ownership concentration risk
        if (analysis.totalSupply > 0) {
            uint256 creatorPercentage = (analysis.creatorBalance * 100) / analysis.totalSupply;
            
            if (creatorPercentage > 90) {
                score += 40;
            } else if (creatorPercentage > 70) {
                score += 30;
            } else if (creatorPercentage > 50) {
                score += 20;
            }
        }
        
        // Ownership status
        if (analysis.hasOwner && !analysis.hasRenounced) {
            score += 30;
        }
        
        // Additional checks would go here
        
        return score > 100 ? 100 : score;
    }
    
    /**
     * @dev Get analysis results for a token
     */
    function getTokenAnalysis(address tokenAddress) external view returns (TokenAnalysis memory) {
        return tokenAnalyses[tokenAddress];
    }
}
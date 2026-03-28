<#
.SYNOPSIS
  Build backend Docker image, push to ECR, and roll out ECS Fargate service.

.DESCRIPTION
  Run from repo root, or pass -RepoRoot. Requires: Docker, AWS CLI v2, aws configure.

.PARAMETER Region
  AWS region (default: ap-south-1).

.PARAMETER ImageTag
  Image tag to push (default: latest). Prefer dated tags for traceability, e.g. 2026-03-28-1.

.PARAMETER SkipWait
  Do not wait for ECS service to stabilize after deployment.

.EXAMPLE
  .\scripts\deploy-backend-aws.ps1

.EXAMPLE
  .\scripts\deploy-backend-aws.ps1 -ImageTag "2026-03-28-1" -SkipWait:$false
#>
[CmdletBinding()]
param(
    [string] $Region = "ap-south-1",
    [string] $Cluster = "movinglines-cluster",
    [string] $Service = "movinglines-service",
    [string] $Repository = "movinglines-backend",
    [string] $ImageTag = "latest",
    [string] $RepoRoot = "",
    [switch] $SkipWait
)

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $RepoRoot) {
    $RepoRoot = Split-Path -Parent $ScriptDir
}

$BackendPath = Join-Path $RepoRoot "backend"
if (-not (Test-Path (Join-Path $BackendPath "Dockerfile"))) {
    Write-Error "Dockerfile not found at $BackendPath. Run from repo or set -RepoRoot."
}

Write-Host "==> Resolving AWS account..."
$AccountId = (aws sts get-caller-identity --query Account --output text)
if (-not $AccountId -or $AccountId -match "error|None") {
    Write-Error "Could not get AWS account. Run: aws configure"
}

$EcrHost = "${AccountId}.dk.ecr.${Region}.amazonaws.com"
$EcrUri = "${EcrHost}/${Repository}"

Write-Host "==> ECR login ($EcrHost)..."
aws ecr get-login-password --region $Region | docker login --username AWS --password-stdin $EcrHost

Write-Host "==> docker build..."
docker build -t "${Repository}:${ImageTag}" $BackendPath

$TargetImage = "${EcrUri}:${ImageTag}"
Write-Host "==> docker tag -> $TargetImage"
docker tag "${Repository}:${ImageTag}" $TargetImage

Write-Host "==> docker push $TargetImage"
docker push $TargetImage

Write-Host "==> ECS force new deployment: $Cluster / $Service"
aws ecs update-service --region $Region --cluster $Cluster --service $Service --force-new-deployment | Out-Null

if (-not $SkipWait) {
    Write-Host "==> Waiting for service stable (Ctrl+C skips wait locally; ECS still deploys)..."
    aws ecs wait services-stable --region $Region --cluster $Cluster --services $Service
}

Write-Host ""
Write-Host "Done. Verify:"
Write-Host "  - ECS: cluster $Cluster -> service $Service"
Write-Host "  - Health: https://api.movinglines.co.in/health  (or your ALB HTTPS URL)"
Write-Host ""

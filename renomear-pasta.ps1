# Script para renomear a pasta do projeto
# Execute este script DEPOIS de fechar o GitHub Desktop e qualquer editor

$pastaAtual = "E:\16 - MAIS E MENOS\maisemenos"
$pastaNova = "E:\16 - MAIS E MENOS\Mais com Menos"

if (Test-Path $pastaAtual) {
    try {
        Write-Host "Renomeando pasta de 'maisemenos' para 'Mais com Menos'..."
        Rename-Item -Path $pastaAtual -NewName "Mais com Menos" -Force
        Write-Host "Pasta renomeada com sucesso!" -ForegroundColor Green
        Write-Host "Agora você pode abrir o GitHub Desktop e ele detectará automaticamente a nova pasta." -ForegroundColor Yellow
    }
    catch {
        Write-Host "Erro ao renomear pasta: $_" -ForegroundColor Red
        Write-Host "Certifique-se de que:" -ForegroundColor Yellow
        Write-Host "1. O GitHub Desktop está fechado" -ForegroundColor Yellow
        Write-Host "2. Qualquer editor/IDE está fechado" -ForegroundColor Yellow
        Write-Host "3. Nenhum terminal está usando a pasta" -ForegroundColor Yellow
    }
}
else {
    Write-Host "Pasta não encontrada: $pastaAtual" -ForegroundColor Red
}

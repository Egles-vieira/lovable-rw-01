import os
import shutil

def unificar_arquivos(pasta_origem, arquivo_saida='arquivo_unificado.txt', ignorar_pastas=['node_modules']):
    """
    Unifica o conteúdo de todos os arquivos de uma pasta em um único arquivo txt.
    
    Args:
        pasta_origem (str): Caminho da pasta a ser processada
        arquivo_saida (str): Nome do arquivo de saída
        ignorar_pastas (list): Lista de pastas a serem ignoradas
    """
    
    def eh_pasta_ignorada(caminho):
        """Verifica se a pasta deve ser ignorada - CORRIGIDO"""
        # Obtém o caminho absoluto normalizado
        caminho_absoluto = os.path.abspath(caminho)
        
        # Verifica se qualquer uma das pastas a ignorar está no caminho
        for pasta_ignorada in ignorar_pastas:
            # Cria o padrão de pasta a ser ignorada (com separadores)
            pasta_pattern = os.sep + pasta_ignorada + os.sep
            if pasta_pattern in caminho_absoluto:
                return True
            
            # Verifica se é exatamente a pasta a ser ignorada
            if caminho_absoluto.endswith(os.sep + pasta_ignorada):
                return True
                
        return False
    
    def processar_arquivo(caminho_arquivo, arquivo_saida):
        """Processa um arquivo individual e adiciona ao arquivo unificado"""
        try:
            # Tenta ler com diferentes encodings
            for encoding in ['utf-8', 'latin-1', 'cp1252']:
                try:
                    with open(caminho_arquivo, 'r', encoding=encoding) as arquivo:
                        conteudo = arquivo.read()
                    break
                except UnicodeDecodeError:
                    continue
            else:
                # Se nenhum encoding funcionar, pule o arquivo
                print(f"⚠️  Não foi possível ler o arquivo (encoding): {caminho_arquivo}")
                return
                
            with open(arquivo_saida, 'a', encoding='utf-8') as saida:
                saida.write(f"\n{'='*80}\n")
                saida.write(f"ARQUIVO: {caminho_arquivo}\n")
                saida.write(f"{'='*80}\n\n")
                saida.write(conteudo)
                saida.write("\n\n")
                
            print(f"✅ Processado: {caminho_arquivo}")
                
        except Exception as e:
            print(f"❌ Erro ao processar {caminho_arquivo}: {e}")
    
    def percorrer_pasta(pasta_atual):
        """Percorre recursivamente todas as pastas e arquivos - CORRIGIDO"""
        # Verifica SE deve ignorar esta pasta ANTES de processar
        if eh_pasta_ignorada(pasta_atual):
            print(f"🚫 Ignorando pasta: {pasta_atual}")
            return
            
        try:
            itens = os.listdir(pasta_atual)
        except PermissionError:
            print(f"🔒 Permissão negada para acessar: {pasta_atual}")
            return
        except Exception as e:
            print(f"❌ Erro ao acessar {pasta_atual}: {e}")
            return
            
        for item in itens:
            caminho_completo = os.path.join(pasta_atual, item)
            
            # Para diretórios: verifica se deve ignorar antes de recursão
            if os.path.isdir(caminho_completo):
                if eh_pasta_ignorada(caminho_completo):
                    print(f"🚫 Ignorando pasta: {caminho_completo}")
                    continue
                percorrer_pasta(caminho_completo)
            else:
                # Para arquivos: verifica se está em pasta ignorada
                if not eh_pasta_ignorada(caminho_completo):
                    processar_arquivo(caminho_completo, arquivo_saida)
                else:
                    print(f"🚫 Ignorando arquivo em pasta ignorada: {caminho_completo}")
    
    # Verifica se a pasta de origem existe
    if not os.path.exists(pasta_origem):
        print(f"❌ Erro: A pasta '{pasta_origem}' não existe!")
        return
    
    # Remove o arquivo de saída se já existir
    if os.path.exists(arquivo_saida):
        os.remove(arquivo_saida)
        print(f"📄 Arquivo existente '{arquivo_saida}' removido.")
    
    print(f"🚀 Iniciando unificação da pasta: {pasta_origem}")
    print(f"🚫 Ignorando pastas: {ignorar_pastas}")
    print(f"💾 Arquivo de saída: {arquivo_saida}")
    print("-" * 60)
    
    # Inicia o processamento
    percorrer_pasta(os.path.abspath(pasta_origem))
    
    print("-" * 60)
    
    # Verifica se o arquivo foi criado
    if os.path.exists(arquivo_saida):
        tamanho = os.path.getsize(arquivo_saida)
        print(f"✅ Unificação concluída! Arquivo gerado: {arquivo_saida}")
        print(f"📊 Tamanho do arquivo: {tamanho:,} bytes")
    else:
        print(f"❌ Nenhum arquivo foi processado!")

# Versão mais simples para uso rápido
def unificar_rapido():
    """Versão simplificada que usa a pasta atual"""
    pasta_atual = os.getcwd()
    arquivo_saida = 'unificado.txt'
    
    print(f"📂 Unificando arquivos da pasta atual: {pasta_atual}")
    unificar_arquivos(pasta_atual, arquivo_saida)

# Versão com DEBUG para ver o que está sendo ignorado
def unificar_com_debug():
    """Versão com informações de debug"""
    pasta_atual = os.getcwd()
    arquivo_saida = 'unificado_debug.txt'
    pastas_ignorar = ['node_modules']
    
    print("=== MODO DEBUG ===")
    print(f"Pasta atual: {pasta_atual}")
    print(f"Pastas a ignorar: {pastas_ignorar}")
    print("\nVerificando pastas...")
    
    # Lista todas as pastas para debug
    for root, dirs, files in os.walk(pasta_atual):
        for dir in dirs:
            caminho_completo = os.path.join(root, dir)
            if 'node_modules' in caminho_completo:
                print(f"🚫 ENCONTRADO node_modules em: {caminho_completo}")
    
    print("\nIniciando unificação...")
    unificar_arquivos(pasta_atual, arquivo_saida, pastas_ignorar)

if __name__ == "__main__":
    # Opção 1: Usar a pasta atual (normal)
    unificar_rapido()
    
    # Opção 2: Modo debug para verificar o node_modules
    # unificar_com_debug()
    
    # Opção 3: Especificar pasta personalizada
    # unificar_arquivos('/caminho/para/sua/pasta', 'meu_arquivo_unificado.txt')
    
    # Opção 4: Adicionar mais pastas para ignorar
    # unificar_arquivos('.', 'unificado.txt', ['node_modules', '.git', '__pycache__', 'venv'])
#!/bin/bash

# Script para ejecutar tests E2E secuencialmente
# Creado para evitar problemas de paralelización

echo "=========================================="
echo "Ejecutando tests E2E secuencialmente"
echo "=========================================="
echo ""

# Array de archivos de test E2E
test_files=(
    "test/health.e2e-spec.ts"
    "test/app.e2e-spec.ts"
    "test/database-infrastructure.e2e-spec.ts"
    "test/admin-dashboard.e2e-spec.ts"
    "test/admin-users.e2e-spec.ts"
    "test/ai-health.e2e-spec.ts"
    "test/cache-admin.e2e-spec.ts"
    "test/cache-invalidation-flow.e2e-spec.ts"
    "test/daily-reading.e2e-spec.ts"
    "test/email.e2e-spec.ts"
    "test/health-database-pool.e2e-spec.ts"
    "test/historical-data-migration.e2e-spec.ts"
    "test/input-validation-security.e2e-spec.ts"
    "test/migration-validation.e2e-spec.ts"
    "test/mvp-complete.e2e-spec.ts"
    "test/output-sanitization.e2e-spec.ts"
    "test/password-recovery.e2e-spec.ts"
    "test/predefined-questions.e2e-spec.ts"
    "test/rate-limiting-advanced.e2e-spec.ts"
    "test/rate-limiting.e2e-spec.ts"
    "test/reading-regeneration.e2e-spec.ts"
    "test/readings-hybrid.e2e-spec.ts"
    "test/readings-pagination.e2e-spec.ts"
    "test/readings-share.e2e-spec.ts"
    "test/readings-soft-delete.e2e-spec.ts"
)

# Contadores
total_tests=${#test_files[@]}
passed_tests=0
failed_tests=0

# Archivo de log
log_file="e2e-sequential-results.log"
> "$log_file"  # Limpiar archivo de log

echo "Total de suites a ejecutar: $total_tests" | tee -a "$log_file"
echo "" | tee -a "$log_file"

# Ejecutar cada test
for test_file in "${test_files[@]}"; do
    test_name=$(basename "$test_file" .e2e-spec.ts)
    echo "----------------------------------------" | tee -a "$log_file"
    echo "Ejecutando: $test_name" | tee -a "$log_file"
    echo "----------------------------------------" | tee -a "$log_file"
    
    # Ejecutar test con timeout de 120 segundos
    if timeout 120 npm run test:e2e -- "$test_file" --forceExit >> "$log_file" 2>&1; then
        echo "✅ PASSED: $test_name" | tee -a "$log_file"
        ((passed_tests++))
    else
        exit_code=$?
        if [ $exit_code -eq 124 ]; then
            echo "⏱️  TIMEOUT: $test_name" | tee -a "$log_file"
        else
            echo "❌ FAILED: $test_name (exit code: $exit_code)" | tee -a "$log_file"
        fi
        ((failed_tests++))
    fi
    
    echo "" | tee -a "$log_file"
done

# Resumen final
echo "==========================================" | tee -a "$log_file"
echo "RESUMEN FINAL" | tee -a "$log_file"
echo "==========================================" | tee -a "$log_file"
echo "Total: $total_tests" | tee -a "$log_file"
echo "Passed: $passed_tests" | tee -a "$log_file"
echo "Failed: $failed_tests" | tee -a "$log_file"
echo "" | tee -a "$log_file"
echo "Resultados completos guardados en: $log_file" | tee -a "$log_file"

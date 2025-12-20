#!/bin/bash
# Fix admin test mocks with correct backend fields

files=(
  "src/hooks/queries/useAdminPlans.test.tsx"
  "src/components/features/admin/PlanConfigCard.test.tsx"
  "src/components/features/admin/PlanComparisonTable.test.tsx"
  "src/app/admin/planes/page.test.tsx"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    # Replace old fields with new ones
    sed -i 's/dailyReadingLimit/readingsLimit/g' "$file"
    sed -i 's/monthlyAIQuota/aiQuotaMonthly/g' "$file"
    sed -i 's/canUseCustomQuestions/allowCustomQuestions/g' "$file"
    sed -i 's/canShareReadings/allowSharing/g' "$file"
    sed -i 's/canRegenerateInterpretations/allowAdvancedSpreads/g' "$file"
    
    # Remove fields that don't exist in backend
    sed -i '/maxRegenerationsPerReading/d' "$file"
    sed -i '/historyLimit/d' "$file"
    sed -i '/canBookSessions/d' "$file"
    
    echo "Fixed $file"
  fi
done

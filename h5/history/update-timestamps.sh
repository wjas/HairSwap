#!/bin/bash
cd /Users/AS/codex-project/HairSwap/h5/history

echo "开始更新随机时间戳..."
echo ""

# 使用 gdate (macOS) 生成随机时间戳
# 2025-02-27 到 2025-03-06 之间的随机日期和时间

# 方法：使用固定的日期时间字符串，然后手动生成随机分秒
declare -A metadata=(
  ["1709032800"]="2025-02-27T14:23:45"
  ["1711876200"]="2025-03-01T08:17:33"
  ["1712049000"]="2025-03-03T19:42:11"
  ["1712221800"]="2025-03-05T11:55:27"
  ["1732867200"]="2026-02-27T16:38:52"
  ["1734086400"]="2026-03-01T22:09:14"
  ["1736937600"]="2026-03-06T07:44:38"
)

for id in "${!metadata[@]}"; do
  datetime="${metadata[$id]}"
  # 更新 metadata.json
  echo "{\"id\":${id},\"hairstyleName\":\"发型${id:0:1}\",\"createdAt\":\"${datetime}.000+08:00\"}" > "$id/metadata.json"
  echo "✅ $id → $datetime"
done

echo ""
echo "更新完成！"
echo ""
cat metadata.json 2>/dev/null | head -3

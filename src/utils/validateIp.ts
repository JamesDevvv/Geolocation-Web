/**
 * Validate IPv4 and IPv6 addresses.
 * - IPv4: 0.0.0.0 to 255.255.255.255
 * - IPv6: standard/full/shortened forms
 */
const ipv4Segment =
  '(25[0-5]|2[0-4]\\d|1\\d{2}|[1-9]?\\d)';
const ipv4Regex = new RegExp(
  `^(${ipv4Segment}\\.){3}${ipv4Segment}$`
);

const ipv6Segment = '[0-9A-Fa-f]{1,4}';
const ipv6Regex = new RegExp(
  '^(' +
    `(${ipv6Segment}:){7}${ipv6Segment}|` + // 1:2:3:4:5:6:7:8
    `(${ipv6Segment}:){1,7}:|` + // 1::                              1:2:3:4:5:6:7::
    `(${ipv6Segment}:){1,6}:${ipv6Segment}|` + // 1::8             1:2:3:4:5:6::8
    `(${ipv6Segment}:){1,5}(:${ipv6Segment}){1,2}|` + // 1::7:8     1:2:3:4:5::7:8
    `(${ipv6Segment}:){1,4}(:${ipv6Segment}){1,3}|` + // 1::6:7:8   1:2:3:4::6:7:8
    `(${ipv6Segment}:){1,3}(:${ipv6Segment}){1,4}|` + // 1::5:6:7:8 1:2:3::5:6:7:8
    `(${ipv6Segment}:){1,2}(:${ipv6Segment}){1,5}|` + // 1::4:5:6:7:8 1:2::4:5:6:7:8
    `${ipv6Segment}(:${ipv6Segment}){1,6}|` + // 1::3:4:5:6:7:8
    `:((:${ipv6Segment}){1,7}|:)` + // ::2:3:4:5:6:7:8 :: 
  ')$'
);

export function isValidIp(ip: string): boolean {
  if (!ip) return false;
  const trimmed = ip.trim();
  return ipv4Regex.test(trimmed) || ipv6Regex.test(trimmed);
}

import type { FC } from 'react';

import Loader from '@components/Shared/Loader';
import { useUserRateLimitQuery } from '@hey/lens';
import { Card, ErrorMessage } from '@hey/ui';
import useProfileStore from 'src/store/persisted/useProfileStore';

const ProgressBar: FC<{ max: number; value: number }> = ({ max, value }) => {
  return (
    <div className="w-full rounded-full bg-gray-200">
      <div
        className="bg-brand-500 h-2.5 rounded-full"
        style={{
          width: `${(value / max) * 100}%`
        }}
      />
    </div>
  );
};

const RateLimits: FC = () => {
  const currentProfile = useProfileStore((state) => state.currentProfile);

  const { data, error, loading } = useUserRateLimitQuery({
    fetchPolicy: 'no-cache',
    variables: {
      request: {
        profileId: currentProfile?.id,
        userAddress: currentProfile?.ownedBy.address
      }
    }
  });

  return (
    <Card className="space-y-2 p-5">
      <div className="text-lg font-bold">Rate Limits</div>
      {loading ? (
        <Loader message="Loading Rate Limits..." />
      ) : error ? (
        <ErrorMessage error={error} />
      ) : data ? (
        <div>
          <b>Momoka</b>
          <div className="mt-1 space-y-5">
            <div className="space-y-2">
              <span className="space-x-2 text-sm text-gray-500">
                <span>Hourly Allowance</span>
                <b>
                  {data.userRateLimit.momoka.hourAllowanceUsed} /{' '}
                  {data.userRateLimit.momoka.hourAllowance}
                </b>
              </span>
              <ProgressBar
                max={data.userRateLimit.momoka.hourAllowance}
                value={data.userRateLimit.momoka.hourAllowanceUsed}
              />
            </div>
            <div className="space-y-2">
              <span className="space-x-2 text-sm text-gray-500">
                <span>Daily Allowance</span>
                <b>
                  {data.userRateLimit.momoka.dayAllowanceUsed} /{' '}
                  {data.userRateLimit.momoka.dayAllowance}
                </b>
              </span>
              <ProgressBar
                max={data.userRateLimit.momoka.dayAllowance}
                value={data.userRateLimit.momoka.dayAllowanceUsed}
              />
            </div>
          </div>
          <div className="divider my-5" />
          <b>On-chain</b>
          <div className="mt-1 space-y-5">
            <div className="space-y-2">
              <span className="space-x-2 text-sm text-gray-500">
                <span>Hourly Allowance</span>
                <b>
                  {data.userRateLimit.onchain.hourAllowanceUsed} /{' '}
                  {data.userRateLimit.onchain.hourAllowance}
                </b>
              </span>
              <ProgressBar
                max={data.userRateLimit.onchain.hourAllowance}
                value={data.userRateLimit.onchain.hourAllowanceUsed}
              />
            </div>
            <div className="space-y-2">
              <span className="space-x-2 text-sm text-gray-500">
                <span>Daily Allowance</span>
                <b>
                  {data.userRateLimit.onchain.dayAllowanceUsed} /{' '}
                  {data.userRateLimit.onchain.dayAllowance}
                </b>
              </span>
              <ProgressBar
                max={data.userRateLimit.onchain.dayAllowance}
                value={data.userRateLimit.onchain.dayAllowanceUsed}
              />
            </div>
          </div>
        </div>
      ) : null}
    </Card>
  );
};

export default RateLimits;

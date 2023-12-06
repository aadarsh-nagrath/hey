import type { NextPage } from 'next';

import MetaTags from '@components/Common/MetaTags';
import SettingsHelper from '@components/Shared/SettingsHelper';
import { CheckCircleIcon, PencilIcon } from '@heroicons/react/24/outline';
import { Errors } from '@hey/data';
import { APP_NAME, HEY_API_URL } from '@hey/data/constants';
import { PAGEVIEW } from '@hey/data/tracking';
import {
  Button,
  Card,
  EmptyState,
  Form,
  GridItemEight,
  GridItemFour,
  GridLayout,
  Input,
  Select,
  Spinner,
  TextArea,
  useZodForm
} from '@hey/ui';
import isFeatureEnabled from '@lib/isFeatureEnabled';
import { Leafwatch } from '@lib/leafwatch';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import Custom404 from 'src/pages/404';
import { usePreferencesStore } from 'src/store/non-persisted/usePreferencesStore';
import { useEffectOnce } from 'usehooks-ts';
import { object, string } from 'zod';

const newTicketSchema = object({
  email: string().email({ message: 'Email is not valid' }),
  message: string()
    .min(1, { message: 'Message should not be empty' })
    .max(5000, {
      message: 'Message should not exceed 5000 characters'
    }),
  subject: string()
    .min(1, { message: 'Subject should not be empty' })
    .max(260, {
      message: 'Subject should not exceed 260 characters'
    }),
  type: string()
});

const Support: NextPage = () => {
  const preferences = usePreferencesStore((state) => state.preferences);

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const form = useZodForm({
    schema: newTicketSchema
  });

  useEffectOnce(() => {
    Leafwatch.track(PAGEVIEW, { page: 'support' });
  });

  useEffect(() => {
    if (preferences?.email) {
      form.setValue('email', preferences.email);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preferences]);

  if (!isFeatureEnabled('support')) {
    return <Custom404 />;
  }

  const createTicket = async (
    email: string,
    type: string,
    subject: string,
    message: string
  ) => {
    setSubmitting(true);
    try {
      const { data } = await axios.post(`${HEY_API_URL}/support/create`, {
        email,
        message,
        subject,
        type
      });

      if (data.success) {
        setSubmitted(true);
      } else {
        toast.error(data?.message ?? Errors.SomethingWentWrong);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <GridLayout>
      <MetaTags title={`Support • ${APP_NAME}`} />
      <GridItemFour>
        <SettingsHelper
          description="Contact us to help you get the issue resolved."
          heading={`Contact ${APP_NAME}`}
        />
      </GridItemFour>
      <GridItemEight>
        <Card>
          {submitted ? (
            <EmptyState
              hideCard
              icon={<CheckCircleIcon className="h-14 w-14 text-green-500" />}
              message="We have received your message and will get back to you as soon as possible."
            />
          ) : (
            <Form
              className="space-y-4 p-5"
              form={form}
              onSubmit={async ({ email, message, subject, type }) => {
                await createTicket(email, type, subject, message);
              }}
            >
              <Input
                disabled={Boolean(preferences?.email)}
                label="Email"
                placeholder="gavin@hooli.com"
                {...form.register('email')}
              />
              <Select
                label="Category"
                options={[
                  { label: 'Support', value: 1 },
                  { label: 'Bug report', value: 2 },
                  { label: 'Feature request', value: 3 },
                  { label: 'Other', value: 4 }
                ]}
                {...form.register('type')}
              />
              <Input
                label="Subject"
                placeholder="What happened?"
                {...form.register('subject')}
              />
              <TextArea
                label="Message"
                placeholder="How can we help?"
                rows={7}
                {...form.register('message')}
              />
              <div className="ml-auto">
                <Button
                  disabled={submitting}
                  icon={
                    submitting ? (
                      <Spinner size="xs" />
                    ) : (
                      <PencilIcon className="h-5 w-5" />
                    )
                  }
                  type="submit"
                >
                  Submit
                </Button>
              </div>
            </Form>
          )}
        </Card>
      </GridItemEight>
    </GridLayout>
  );
};

export default Support;
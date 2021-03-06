// @flow

import React, { Component } from 'react'
import { View } from 'react-native'

import * as intl from '../../locales/intl.js'
import s from '../../locales/strings.js'
import type { ExchangeRatesState } from '../../modules/ExchangeRates/reducer'
import { isRejectedFioRequest, isSentFioRequest } from '../../modules/FioRequest/util'
import T from '../../modules/UI/components/FormattedText/FormattedText.ui.js'
import SafeAreaView from '../../modules/UI/components/SafeAreaView/SafeAreaView.ui.js'
import { styles } from '../../styles/scenes/FioSentRequestDetailsStyle.js'
import type { FioRequest } from '../../types/types'
import { SceneWrapper } from '../common/SceneWrapper'

export type NavigationProps = {
  selectedFioSentRequest: FioRequest
}

export type FioSentRequestDetailsProps = {
  fiatSymbol: string,
  isoFiatCurrencyCode: string,
  exchangeRates: ExchangeRatesState
}

export type FioSentRequestDetailsDispatchProps = {}

type Props = FioSentRequestDetailsProps & FioSentRequestDetailsDispatchProps & NavigationProps

type LocalState = {
  memo: string,
  focused: boolean
}

export class FioSentRequestDetailsComponent extends Component<Props, LocalState> {
  constructor(props: Props) {
    super(props)
    const state: LocalState = {
      memo: '',
      focused: false
    }
    this.state = state
  }

  fiatAmount = (currencyCode: string, amount: string) => {
    const { exchangeRates, isoFiatCurrencyCode } = this.props
    const rateKey = `${currencyCode}_${isoFiatCurrencyCode}`
    const fiatPerCrypto = exchangeRates[rateKey] ? exchangeRates[rateKey] : 0
    const amountToMultiply = parseFloat(amount)

    return intl.formatNumber(fiatPerCrypto * amountToMultiply, { toFixed: 2 }) || '0'
  }

  amountField = () => {
    return (
      <View style={styles.row}>
        <T style={styles.title}>
          {s.strings.fio_request_amount} {this.props.selectedFioSentRequest.content.amount} {this.props.selectedFioSentRequest.content.token_code} (
          {this.props.fiatSymbol}
          {this.fiatAmount(this.props.selectedFioSentRequest.content.token_code, this.props.selectedFioSentRequest.content.amount)})
        </T>
      </View>
    )
  }

  requestedField = (payer: string, status: string) => {
    let statusLabel = <T style={styles.title}>{s.strings.fio_request_sent_details_to}</T>
    if (isSentFioRequest(status)) {
      statusLabel = <T style={[styles.title, styles.titleReceived]}>{s.strings.fragment_transaction_list_receive_prefix}</T>
    }
    if (isRejectedFioRequest(status)) {
      statusLabel = <T style={[styles.title, styles.titleRejected]}>{s.strings.fio_reject_status}</T>
    }
    return (
      <View style={styles.row}>
        {statusLabel}
        <T style={styles.text}>{payer}</T>
      </View>
    )
  }

  memoField = (memo: string) => {
    if (memo) {
      return (
        <View style={styles.row}>
          <T style={styles.title}>{s.strings.unique_identifier_memo}</T>
          <T style={styles.text}>{memo}</T>
        </View>
      )
    }

    return <View style={styles.row} />
  }

  dateField = (date: Date) => {
    return (
      <View style={styles.row}>
        <T style={styles.title}>{s.strings.fio_date_label}</T>
        <T style={styles.text}>{intl.formatExpDate(date, true)}</T>
      </View>
    )
  }

  render() {
    return (
      <SceneWrapper>
        <SafeAreaView>
          <View>{this.amountField()}</View>
          <View style={styles.row}>
            <T style={styles.title}>{s.strings.fio_request_sent_details_from}</T>
            <T style={styles.text}>{this.props.selectedFioSentRequest.payee_fio_address}</T>
          </View>
          <View>{this.requestedField(this.props.selectedFioSentRequest.payer_fio_address, this.props.selectedFioSentRequest.status)}</View>
          <View>{this.dateField(new Date(this.props.selectedFioSentRequest.time_stamp))}</View>
          <View>{this.memoField(this.props.selectedFioSentRequest.content.memo)}</View>
          <View style={styles.lineRow}>
            <View style={styles.line} />
          </View>
        </SafeAreaView>
      </SceneWrapper>
    )
  }
}
